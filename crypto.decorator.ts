import 'reflect-metadata';

const cryptoFieldsMetadataKey = Symbol("cryptoFields");

export function CryptoField(): PropertyDecorator {
  return (target, propertyKey) => {
    const fields = Reflect.getMetadata(cryptoFieldsMetadataKey, target) || [];
    fields.push(propertyKey);
    Reflect.defineMetadata(cryptoFieldsMetadataKey, fields, target);
  };
}

export function getCryptoFields(target: any): string[] {
  return Reflect.getMetadata(cryptoFieldsMetadataKey, target) || [];
}