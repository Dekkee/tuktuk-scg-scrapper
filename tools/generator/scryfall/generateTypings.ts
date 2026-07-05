import * as fs from 'fs';

if (!fs.existsSync('./generated/typing')) {
    fs.mkdirSync('./generated/typing', { recursive: true });
}

const extractRe = /\((\w+)\)$/;

const toPascalCase = (camelCaseString: string) =>
    `${camelCaseString[0].toUpperCase()}${camelCaseString.slice(1)}`;
const primitives = new Set(['string', 'number', 'boolean']);

// Map a single schema type token to its TypeScript type:
//   array(number) -> number[]   array(card) -> Card[]
//   object(foo)   -> Foo        string/number/boolean -> unchanged
const mapType = (rawType: string): string => {
    if (rawType.includes('array')) {
        const [, extracted] = rawType.match(extractRe) || [];
        return `${primitives.has(extracted) ? extracted : toPascalCase(extracted)}[]`;
    }

    if (rawType.includes('object')) {
        const [, extracted] = rawType.match(extractRe) || [];
        return toPascalCase(extracted);
    }

    return rawType;
};

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
            // A field may carry a union of types (e.g. ["string", "object(foo)"]).
            // Map each member and join with `|`; the old code interpolated the raw
            // array, emitting invalid TS like `foo?: string,object(foo),`.
            const calculatedType = Array.isArray(value.type)
                ? value.type.map(mapType).join(' | ')
                : mapType(value.type);

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
