import AntButton from 'antd/es/button';
import AntSlider from 'antd/es/slider';
import {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import Cropper from 'react-easy-crop';
import type { Area, MediaSize, Point } from 'react-easy-crop/types';
import {
  ASPECT_MAX,
  ASPECT_MIN,
  ASPECT_STEP,
  PREFIX,
  ROTATION_INITIAL,
  ROTATION_MAX,
  ROTATION_MIN,
  ROTATION_STEP,
  ZOOM_INITIAL,
  ZOOM_STEP,
} from './constants';
import type { EasyCropProps, EasyCropRef } from './types';

const EasyCrop = forwardRef<EasyCropRef, EasyCropProps>((props, ref) => {
  const {
    ratioX,
    ratioY,
    cropperRef,
    zoomSlider,
    rotationSlider,
    aspectSlider,
    showReset,
    resetBtnText,

    modalImage,
    aspect: ASPECT_INITIAL,
    minZoom,
    maxZoom,
    cropShape,
    showGrid,

    cropperProps,
  } = props;

  const [zoom, setZoom] = useState(ZOOM_INITIAL);
  const [rotation, setRotation] = useState(ROTATION_INITIAL);
  const [aspect, setAspect] = useState(ASPECT_INITIAL);

  const isResetActive =
    zoom !== ZOOM_INITIAL ||
    rotation !== ROTATION_INITIAL ||
    aspect !== ASPECT_INITIAL;

  const onReset = () => {
    setZoom(ZOOM_INITIAL);
    setRotation(ROTATION_INITIAL);
    setAspect(ASPECT_INITIAL);
  };

  const [crop, onCropChange] = useState<Point>({ x: 0, y: 0 });
  const cropPixelsRef = useRef<Area>({ width: 0, height: 0, x: 0, y: 0 });
  const [cropSize, setCropSize] = useState({ width: 0, height: 0 });

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    cropPixelsRef.current = croppedAreaPixels;
    let cropWidth = croppedAreaPixels.width
    let cropHeight = croppedAreaPixels.height
    if (ratioX!=null){
      const wg = Math.floor(cropWidth / ratioX);
      const hg = Math.floor(cropHeight / ratioY);
      const g = Math.min(wg,hg);
      cropWidth = ratioX * g;
      cropHeight = ratioY * g;
    }
    croppedAreaPixels.width = cropWidth
    croppedAreaPixels.height = cropHeight
    cropPixelsRef.current = croppedAreaPixels
  }, []);

  useImperativeHandle(ref, () => ({
    rotation,
    cropPixelsRef,
    onReset,
  }));

  const wrapperClass =
    '[display:flex] [align-items:center] [width:60%] [margin-inline:auto]';

  const buttonClass =
    '[display:flex] [align-items:center] [justify-content:center] [height:32px] [width:32px] [background:transparent] [border:0] [font-family:inherit] [font-size:18px] [cursor:pointer] disabled:[opacity:20%] disabled:[cursor:default]';

  const sliderClass = '[flex:1]';

  const onMediaLoaded = useCallback(
    (mediaSize: MediaSize) => {
      const { width, height, naturalWidth, naturalHeight } = mediaSize;
      let cropAreaWidth = width
      let cropAreaHeight = height
      let cropImgWidth = naturalWidth
      let cropImgHeight = naturalHeight
      let cropWidth = width
      let cropHeight = height
      if (ratioX!=null){
        const awg = Math.floor(cropAreaWidth / ratioX);
        const ahg = Math.floor(cropAreaHeight / ratioY);
        const ag = Math.min(awg,ahg);
        cropAreaWidth = ratioX * ag;
        cropAreaHeight = ratioY * ag; 
        const iwg = Math.floor(cropImgWidth / ratioX); 
        const ihg = Math.floor(cropImgHeight / ratioY);
        const ig = Math.min(iwg,ihg);
        cropImgWidth = ratioX * ig;
        cropImgHeight = ratioY * ig;
      }
      if (cropImgWidth > cropAreaWidth){
        cropWidth = cropImgWidth / (naturalWidth / width)
        cropHeight = cropImgHeight / (naturalHeight / height)
      } else {
        cropWidth = cropAreaWidth
        cropHeight = cropAreaHeight
      }
      setCropSize({ width: cropWidth, height: cropHeight })
    },
    [aspect]
  );

  return (
    <>
      <Cropper
        {...cropperProps}
        cropSize={cropSize}
        ref={cropperRef}
        image={modalImage}
        crop={crop}
        //
        zoom={zoom}
        rotation={rotation}
        aspect={aspect}
        minZoom={minZoom}
        maxZoom={maxZoom}
        zoomWithScroll={zoomSlider}
        //
        cropShape={cropShape}
        showGrid={showGrid}
        onCropChange={onCropChange}
        onZoomChange={setZoom}
        onRotationChange={setRotation}
        onMediaLoaded={onMediaLoaded}
        onCropComplete={onCropComplete}
        classes={{
          containerClassName: `${PREFIX}-container ![position:relative] [width:100%] [height:40vh] [&~section:first-of-type]:[margin-top:16px] [&~section:last-of-type]:[margin-bottom:16px]`,
          mediaClassName: `${PREFIX}-media`,
        }}
      />

      {zoomSlider && (
        <section
          className={`${PREFIX}-control ${PREFIX}-control-zoom ${wrapperClass}`}
        >
          <button
            className={buttonClass}
            onClick={() => setZoom(+(zoom - ZOOM_STEP).toFixed(1))}
            disabled={zoom - ZOOM_STEP < minZoom}
          >
            －
          </button>
          <AntSlider
            className={sliderClass}
            min={minZoom}
            max={maxZoom}
            step={ZOOM_STEP}
            value={zoom}
            onChange={setZoom}
          />
          <button
            className={buttonClass}
            onClick={() => setZoom(+(zoom + ZOOM_STEP).toFixed(1))}
            disabled={zoom + ZOOM_STEP > maxZoom}
          >
            ＋
          </button>
        </section>
      )}

      {rotationSlider && (
        <section
          className={`${PREFIX}-control ${PREFIX}-control-rotation ${wrapperClass}`}
        >
          <button
            className={`${buttonClass} [font-size:16px]`}
            onClick={() => setRotation(rotation - ROTATION_STEP)}
            disabled={rotation === ROTATION_MIN}
          >
            ↺
          </button>
          <AntSlider
            className={sliderClass}
            min={ROTATION_MIN}
            max={ROTATION_MAX}
            step={ROTATION_STEP}
            value={rotation}
            onChange={setRotation}
          />
          <button
            className={`${buttonClass} [font-size:16px]`}
            onClick={() => setRotation(rotation + ROTATION_STEP)}
            disabled={rotation === ROTATION_MAX}
          >
            ↻
          </button>
        </section>
      )}

      {aspectSlider && (
        <section
          className={`${PREFIX}-control ${PREFIX}-control-aspect ${wrapperClass}`}
        >
          <button
            className={buttonClass}
            onClick={() => setAspect(+(aspect - ASPECT_STEP).toFixed(2))}
            disabled={aspect - ASPECT_STEP < ASPECT_MIN}
          >
            ↕️
          </button>
          <AntSlider
            className={sliderClass}
            min={ASPECT_MIN}
            max={ASPECT_MAX}
            step={ASPECT_STEP}
            value={aspect}
            onChange={setAspect}
          />
          <button
            className={buttonClass}
            onClick={() => setAspect(+(aspect + ASPECT_STEP).toFixed(2))}
            disabled={aspect + ASPECT_STEP > ASPECT_MAX}
          >
            ↔️
          </button>
        </section>
      )}

      {showReset && (zoomSlider || rotationSlider || aspectSlider) && (
        <AntButton
          className="[bottom:20px] [position:absolute]"
          style={isResetActive ? {} : { opacity: 0.3, pointerEvents: 'none' }}
          onClick={onReset}
        >
          {resetBtnText}
        </AntButton>
      )}
    </>
  );
});

export default memo(EasyCrop);
