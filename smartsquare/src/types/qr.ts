export type DotsStyle = 'square' | 'dots' | 'rounded' | 'extra-rounded' | 'classy' | 'classy-rounded';
export type CornersSquareStyle = 'square' | 'dot' | 'extra-rounded';
export type CornersDotStyle = 'square' | 'dot';
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
export type Mode = 'Numeric' | 'Alphanumeric' | 'Byte' | 'Kanji';

export interface QRCodeOptions {
  data: string;
  image?: string;
  width: number;
  height: number;
  margin: number;
  qrOptions: {
    typeNumber: number;
    mode: Mode;
    errorCorrectionLevel: ErrorCorrectionLevel;
  };
  dotsOptions: {
    type: DotsStyle;
    color: string;
  };
  cornersSquareOptions: {
    type: CornersSquareStyle;
    color: string;
  };
  cornersDotOptions: {
    type: CornersDotStyle;
    color: string;
  };
  backgroundOptions: {
    color: string;
  };
  imageOptions: {
    hideBackgroundDots: boolean;
    imageSize: number;
    margin: number;
  };
}
