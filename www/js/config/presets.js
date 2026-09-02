import { RADIOS } from "./radios.js";

export const PRESETS = {
    classicas: [
        {
            title: "Duran Duran",
            src: "./msc/duran.mp3"
        },
        {
            title: "China",
            src: "./msc/china.mp3"
        }
    ],

    radio: [
        {
            title: RADIOS.kiss.title,
            src: RADIOS.kiss.stream,
            isRadio: true,
            radioId: "kiss"
        },
        {
            title: RADIOS.aspen.title,
            src: RADIOS.aspen.stream,
            isRadio: true,
            radioId: "aspen"
        },
        {
            title: RADIOS.maoTseNorton.title,
            src: RADIOS.maoTseNorton.stream,
            isRadio: true,
            radioId: "maoTseNorton"
        }
    ]
};

