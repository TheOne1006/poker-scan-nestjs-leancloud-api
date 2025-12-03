export type ProductItem = {
    productId: string;
    desc: string;
    vipDays: number;
}


export const purchaseProjects: ProductItem[] = [
    { productId: 'io.theone.test.sub.noauto.7d', desc: 'VIP 7天', vipDays: 7},
    { productId: 'io.theone.test.sub.noauto.monthly', desc: 'VIP 1个月', vipDays: 31},
    { productId: 'io.theone.test.sub.noauto.yearly', desc: 'VIP 1年', vipDays: 365},

    // prod
    { productId: 'io.theone.prod.sub.noauto.7d', desc: 'VIP 7天', vipDays: 7 },
    { productId: 'io.theone.prod.sub.noauto.monthly', desc: 'VIP 1个月', vipDays: 31 },
    { productId: 'io.theone.prod.sub.noauto.yearly', desc: 'VIP 1年', vipDays: 365 },
]
