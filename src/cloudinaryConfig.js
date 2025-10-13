import { Cloudinary } from "@cloudinary/url-gen";

const cld = new Cloudinary({
    cloud: {
        cloudName: "dmtjht9ie", // reemplaza con el tuyo
    },
});

export default cld;
