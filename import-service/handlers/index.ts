import { container } from "tsyringe";
import { importFileParserHandler } from './import-file-parser';
import { importProductsFileHandler } from './import-products-file';

export const importProductsFile = importProductsFileHandler(container);
export const importFileParser = importFileParserHandler(container);
