import * as fs from 'fs';

if (!fs.existsSync('./generated/typing')) {
    fs.mkdirSync('./generated/typing', { recursive: true });
}

const extractRe = /\((\w+)\)$/;

const toPascalCase = (camelCaseString: string) =>
    `${camelCaseString[0].toUpperCase()}${camelCaseString.slice(1)}`;
const primitives = new Set(['string', 'number', 'boolean']);

export const generateTypings = async () => {
    const schemas = fs.readdirSync('./generated/schema');
    const availableTypes = new Set();
    schemas.forEach(schema => {
        const [, name] = schema.match(/(\w+)\.json/);
        availableTypes.add(name);
    });
    const typedSchemas = [];
    availableTypes.forEach(schema => {
        const content = JSON.parse(
            fs.readFileSync(`./generated/schema/${schema}.json`).toString()
        );
        const ts = Object.entries(content).map(([key, value]: any[]) => {
            let calculatedType = value.type;

            if (value.type.includes('array')) {
                const [, extracted] = value.type.match(extractRe) || [];
                calculatedType = `${
                    primitives.has(extracted)
                        ? extracted
                        : toPascalCase(extracted)
                }[]`;
            }

            if (value.type.includes('object')) {
                const [, extracted] = value.type.match(extractRe) || [];
                calculatedType = toPascalCase(extracted);
            }

            return `\t${key}${value.required ? '' : '?'}: ${calculatedType},\n`;
        });
        typedSchemas.push(
            `export type ${toPascalCase(schema as string)} = {\n${ts.join(
                ''
            )}}\n`
        );
    });
    fs.writeFileSync('./generated/typing/index.d.ts', typedSchemas.join('\n'));
};
