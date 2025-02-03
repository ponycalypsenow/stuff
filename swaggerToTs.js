#!/usr/bin/env node
const fs = require('fs');
const file = process.argv[2] || 'swagger.json';
const swagger = JSON.parse(fs.readFileSync(file, 'utf8'));

/**
 * Recursively converts a JSON schema to a TypeScript type.
 * – If a $ref is encountered, returns the referenced name.
 * – If an enum is present, returns a union of literal values.
 * – For objects, builds a property list and honors required/optional.
 * – Also supports additionalProperties.
 */
const schemaToTs = s => {
  if (s.$ref) return s.$ref.split('/').pop();
  if (s.enum) return s.enum.map(v => JSON.stringify(v)).join(' | ');
  if (s.type === 'object') {
    if (s.properties) {
      const props = Object.entries(s.properties)
        .map(
          ([k, v]) =>
            `  ${k}${s.required && s.required.includes(k) ? '' : '?'}: ${schemaToTs(v)};`
        )
        .join('\n');
      const additional = s.additionalProperties
        ? `\n  [key: string]: ${schemaToTs(s.additionalProperties)};`
        : '';
      return `{\n${props}${additional}\n}`;
    }
    if (s.additionalProperties)
      return `{ [key: string]: ${schemaToTs(s.additionalProperties)}; }`;
    return '{}';
  }
  if (s.type === 'array') return `${schemaToTs(s.items)}[]`;
  if (s.type === 'string') return 'string';
  if (s.type === 'integer' || s.type === 'number') return 'number';
  if (s.type === 'boolean') return 'boolean';
  return 'any';
};

// Generate component types from swagger.components.schemas
let compTypes = '';
if (swagger.components && swagger.components.schemas) {
  Object.entries(swagger.components.schemas).forEach(([name, schema]) => {
    const def =
      schema.type === 'object'
        ? `export interface ${name} ${schemaToTs(schema)}`
        : `export type ${name} = ${schemaToTs(schema)};`;
    compTypes += def + '\n\n';
  });
}

// Generate endpoint request/response types and RTK Query endpoints
let typeDefs = '';
let endpointsStr = '';
const epNames = [];

Object.entries(swagger.paths).forEach(([p, methods]) => {
  Object.entries(methods).forEach(([m, details]) => {
    const epName = m + p.replace(/[^a-zA-Z0-9]/g, '_');
    epNames.push(epName);

    // Build a type from any parameters (from query, path, etc.)
    let paramsSchema = '';
    if (details.parameters && details.parameters.length) {
      const props = details.parameters
        .map(param => {
          const name = param.name;
          const optional = param.required ? '' : '?';
          // Use schemaToTs so that enums or $refs get processed
          const typeStr = param.schema ? schemaToTs(param.schema) : 'any';
          return `  ${name}${optional}: ${typeStr};`;
        })
        .join('\n');
      paramsSchema = `{\n${props}\n}`;
    }

    // Build a type from requestBody (if present, using application/json)
    let bodySchema = '';
    if (
      details.requestBody &&
      details.requestBody.content &&
      details.requestBody.content['application/json'] &&
      details.requestBody.content['application/json'].schema
    ) {
      bodySchema = schemaToTs(details.requestBody.content['application/json'].schema);
    }

    // Combine the parameters and requestBody if both exist.
    // (If only one exists, use that; if neither, default to any.)
    let reqType = '';
    if (paramsSchema && bodySchema) reqType = `(${paramsSchema}) & (${bodySchema})`;
    else if (paramsSchema) reqType = paramsSchema;
    else if (bodySchema) reqType = bodySchema;
    else reqType = 'any';

    const reqDef = `export type ${epName}Request = ${reqType};\n`;

    // Choose a response schema.
    // We look for the first response that has an application/json schema.
    let resSchema = '';
    if (details.responses) {
      const resp = Object.values(details.responses).find(
        r => r.content && r.content['application/json'] && r.content['application/json'].schema
      );
      if (resp)
        resSchema = schemaToTs(resp.content['application/json'].schema);
    }
    const resDef = `export type ${epName}Response = ${resSchema || 'any'};\n`;

    typeDefs += reqDef + resDef + '\n';

    // For GET use builder.query; for others use builder.mutation.
    const qm = m.toLowerCase() === 'get' ? 'query' : 'mutation';
    // We choose the argument name based on the method.
    // (The same argument is used to fill any URL path parameters via a template.)
    const arg = qm === 'query' ? 'params' : 'body';
    // Replace path parameters (e.g. {analysisUuid}) with template string substitution.
    const url = p.replace(/{(.*?)}/g, (_, g) => `\${${arg}.${g}}`);

    endpointsStr += `    ${epName}: builder.${qm}<${epName}Response, ${epName}Request>({\n` +
      `      query: (${arg}) => ({ url: \`${url}\`, method: '${m.toUpperCase()}', ${arg} }),\n` +
      `    }),\n\n`;
  });
});

// Assemble the complete TypeScript file.
const ts =
  `import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';\n\n` +
  compTypes +
  typeDefs +
  `export const api = createApi({\n` +
  `  reducerPath: 'api',\n` +
  `  baseQuery: fetchBaseQuery({ baseUrl: 'YOUR_BASE_URL' }),\n` +
  `  endpoints: (builder) => ({\n` +
  endpointsStr +
  `  }),\n` +
  `});\n\n` +
  `export const { ${epNames.join(', ')} } = api;\n`;

fs.writeFileSync('api.ts', ts);
console.log('Generated api.ts');
