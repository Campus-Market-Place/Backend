import { z } from 'zod';
export declare const CreateProductSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    price: z.ZodString;
    isactive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const UpdateProductSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    price: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    categoryId: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodPipe<z.ZodString & z.ZodType<"true" | "false", string, z.core.$ZodTypeInternals<"true" | "false", string>>, z.ZodTransform<boolean, "true" | "false">>]>>;
}, z.core.$strip>;
//# sourceMappingURL=product.validation.d.ts.map