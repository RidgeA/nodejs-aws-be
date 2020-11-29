import { container } from "tsyringe";
import { catalogBatchProcessHandler } from './catalog-batch-process';

import { createProductHandler } from './create-product';
import { getProductByIdHandler } from "./get-product-by-id";
import { getProductListHandler } from './get-product-list';

export const getProductList = getProductListHandler(container);
export const getProductById = getProductByIdHandler(container);
export const createProduct = createProductHandler(container);
export const catalogBatchProcess = catalogBatchProcessHandler(container);
