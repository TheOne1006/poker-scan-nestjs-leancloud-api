export type ProductItem = {
    productId: string;
    desc: string;
    vipDays: number;
}


export const purchaseProjects: ProductItem[] = [
    { productId: 'io.theone.test.sub.noauto.7d', desc: 'VIP 1天', vipDays: 1},
    { productId: 'io.theone.test.sub.noauto.monthly', desc: 'VIP 1个月', vipDays: 31},
    { productId: 'io.theone.test.sub.noauto.yearly', desc: 'VIP 1年', vipDays: 365},
]