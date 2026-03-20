declare module 'opencc-js' {
  interface ConverterOptions {
    from: string;
    to: string;
  }
  
  export function Converter(options: ConverterOptions): (text: string) => string;
  export function CustomConverter(options: { converter: (input: string) => string }): (text: string) => string;
  export const Locale: Record<string, string>;
}
