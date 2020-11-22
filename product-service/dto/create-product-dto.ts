import { IsArray, IsInt, IsOptional, IsString, IsUrl, Min } from "class-validator";

export class CreateProductDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsInt()
  @Min(1)
  price: number;

  @IsInt()
  @Min(0)
  count: number;

  @IsArray()
  @IsOptional()
  @IsUrl({}, { each: true })
  images: string[];
}
