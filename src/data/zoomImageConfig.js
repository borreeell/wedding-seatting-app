// Common styles consts to avoid repetition
const commonStyle210 = { width: "210px", marginLeft: "150px" };
const commonStyle220 = { width: "200px", marginLeft: "160px" };
const commonStyle230 = { width: "200px", marginLeft: "165px" };
const commonStyle240 = { width: "240px", marginLeft: "150px" };

// Shared configuration between tables in layout 3
const sharedTableVariantLayout3 = {
    src: new URL("/layout3/table_variant1_layout3.png", import.meta.url).href,
    style: commonStyle210
};

// Shared configuration between tables in layout 4
const sharedTableVariantLayout4 = {
    src: new URL("/layout4/table_variant1_layout4.png", import.meta.url).href,
    style: commonStyle220
}

// Main configuration for zoomable table images by layout and variant
export const zoomImageConfig = {
    layout1: {
        default: {
            src: new URL("/layout1/default_table_layout1.png", import.meta.url).href,
        },
        4: {
            src: new URL("/layout1/table5_layout1.png", import.meta.url).href,
        }
    },
    layout2: {
        default: { /// revisar imatge taules a les que les cadiras estan en grup de 3
            src: new URL("/layout2/default_table_layout2.png", import.meta.url).href,
            style: commonStyle210
        },
        4: {
            src: new URL("/layout2/table5_layout2.png", import.meta.url).href,
        }
    },
    layout3: {
        default: {
            src: new URL("/layout3/default_table_layout3.png", import.meta.url).href,
            style: commonStyle210
        },
        2: sharedTableVariantLayout3,
        4: sharedTableVariantLayout3,
        6: {
            src: new URL("/layout3/table_variant2_layout3.png", import.meta.url).href,
            style: commonStyle220
        },
        7: {
            src: new URL("/layout3/table_variant3_layout3.png", import.meta.url).href,
            style: commonStyle240
        }
    },
    layout4: {
        default: {
            src: new URL("/layout4/default_table_layout4.png", import.meta.url).href,
            style: commonStyle230
        },
        2: sharedTableVariantLayout4,
        4: sharedTableVariantLayout4,
        6: {
            src: new URL("/layout4/table_variant2_layout4.png", import.meta.url).href,
            style: commonStyle230
        },
        7: {
            src: new URL("/layout4/table_variant3_layout4.png", import.meta.url).href,
            style: commonStyle230
        },
        11: {
            src: new URL("/layout4/table_variant4_layout4.png", import.meta.url).href,
            style: commonStyle240
        },
        12: {
            src: new URL("/layout4/table_variant5_layout4.png", import.meta.url).href,
            style: commonStyle230
        }
    }
}

/// 