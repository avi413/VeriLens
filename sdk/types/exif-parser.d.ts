declare module 'exif-parser' {
  interface ExifTags {
    [key: string]: unknown;
  }

  interface ExifParseResult {
    tags?: ExifTags;
    imageSize?: {
      width: number;
      height: number;
    };
    thumbnailOffset?: number;
    thumbnailLength?: number;
  }

  interface ExifParser {
    parse(): ExifParseResult;
  }

  interface ExifParserFactory {
    create(buffer: Buffer): ExifParser;
  }

  const factory: ExifParserFactory;
  export default factory;
}
