import React from "react";
import "./cameraRoll.css";

import PhotoAlbum from "react-photo-album";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";

import RylandStudioSide from "./photos/RylandStudioSide.jpg";
import Glisan from "./photos/Glisan.png";
import RiceNSpice from "./photos/RiceNSpice.jpg";
import RhodesRoom from "./photos/RhodesRoom.png";
import FineByMe from "./photos/FineByMe.jpg";
import DriveBlur from "./photos/DriveBlur.png";
import BHDenialSingle from "./photos/BHDenialSingle.jpg";

function measure(src, title) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () =>
      resolve({ src, width: img.naturalWidth || 1600, height: img.naturalHeight || 1066, title });
    img.onerror = () => resolve({ src, width: 1600, height: 1066, title });
    img.src = src;
  });
}

const RAW = [
  { src: DriveBlur, title: "DriveBlur" },
  { src: BHDenialSingle, title: "BHDenialSingle" },
  { src: FineByMe, title: "FineByMe" },
  { src: Glisan, title: "Glisan" },
  { src: RhodesRoom, title: "RhodesRoom" },
  { src: RiceNSpice, title: "RiceNSpice" },
  { src: RylandStudioSide, title: "RylandStudioSide" },
];

export default function CameraRoll() {
  const [photos, setPhotos] = React.useState([]);
  const [index, setIndex] = React.useState(-1);

  React.useEffect(() => {
    let alive = true;
    Promise.all(RAW.map(({ src, title }) => measure(src, title))).then((out) => {
      if (alive) setPhotos(out);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!photos.length) {
    return (
      <div className="cameraRollPage">
        <div className="cameraRollLoading">Loading photos…</div>
      </div>
    );
  }

  return (
    <div className="cameraRollPage">
      <PhotoAlbum
        layout="columns"
        columns={2}          // always 2 small columns
        spacing={6}
        photos={photos}
        onClick={({ index }) => setIndex(index)}
        renderPhoto={({ imageProps }) => (
          <img
            {...imageProps}
            loading="lazy"
            alt=""
            style={{ ...imageProps.style, display: "block", borderRadius: 8, objectFit: "cover" }}
          />
        )}
      />

      <Lightbox
        open={index >= 0}
        close={() => setIndex(-1)}
        index={index}
        slides={photos.map((p) => ({ src: p.src, title: p.title }))}
        plugins={[Captions]}
        controller={{ closeOnBackdropClick: true }}
        styles={{ container: { backgroundColor: "rgba(0,0,0,0.95)" } }}
      />
    </div>
  );
}
