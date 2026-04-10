import { z } from 'zod';
export declare const sellerRequestSchema: z.ZodObject<{
    shopName: z.ZodString;
    discription: z.ZodString;
    campusLocation: z.ZodString;
    mainPhone: z.ZodString;
    secondaryPhone: z.ZodOptional<z.ZodString>;
    agreedToRules: z.ZodString & z.ZodType<"1", string, z.core.$ZodTypeInternals<"1", string>>;
    instagram: z.ZodOptional<z.ZodString>;
    telegram: z.ZodOptional<z.ZodString>;
    tiktok: z.ZodOptional<z.ZodString>;
    other: z.ZodOptional<z.ZodUnion<readonly [z.ZodArray<z.ZodString>, z.ZodString]>>;
}, z.core.$strip>;
export declare const sellerUpdateSchema: z.ZodObject<{
    shopName: z.ZodOptional<z.ZodString>;
    discription: z.ZodOptional<z.ZodString>;
    campusLocation: z.ZodOptional<z.ZodString>;
    mainPhone: z.ZodOptional<z.ZodString>;
    secondaryPhone: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodOptional<z.ZodString>;
    agreedToRules: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodBoolean]>>;
    instagram: z.ZodOptional<z.ZodString>;
    telegram: z.ZodOptional<z.ZodString>;
    tiktok: z.ZodOptional<z.ZodString>;
    other: z.ZodOptional<z.ZodUnion<readonly [z.ZodArray<z.ZodString>, z.ZodString]>>;
}, z.core.$strip>;
//# sourceMappingURL=seller.validation.d.ts.map