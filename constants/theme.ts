import { scale, verticalScale } from "@/utils/stylings";

export const colors = {
     primary: {
      main: '#385e92',
      light: '#5f7fab',
      dark: '#2c4a72',
    },
    secondary: {
      main: '#39cccc',
      light: '#63e0e0',
      dark: '#2aa3a3',
    },
     background: {
      default: '#ffffff',
      paper: '#F0F4F8',
    },
    text: {
      primary: '#1c1c1c',
      secondary: '#5f7fab',
      disabled: '#9e9e9e',
      white: "#fff"
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    info: {
      main: '#39cccc',
      light: '#63e0e0',
      dark: '#2aa3a3',
    },
};

export const shapes = {
  initialPadding : 10,
}



export const spacingX = {
    _3 : scale(3),
    _5 : scale(5),
    _7 : scale(7),
    _10 : scale(10),
    _12 : scale(12),
    _15 : scale(15),
    _20 : scale(20),
    _25 : scale(25),
    _30 : scale(30),
    _35 : scale(35),
    _40 : scale(40),
    _100:scale(100)

};

export const spacingY = {
    _3 : verticalScale(3),
    _5 : verticalScale(5),
    _7 : verticalScale(7),
    _10 : verticalScale(10),
    _12 : verticalScale(12),
    _15 : verticalScale(15),
    _20 : verticalScale(20),
    _25 : verticalScale(25),
    _30 : verticalScale(30),
    _35 : verticalScale(35),
    _40 : verticalScale(40),

};

export const radius = {
    _3 : verticalScale(3),
    _6 : verticalScale(6),
    _10 : verticalScale(10),
    _12 : verticalScale(12),
    _15 : verticalScale(15),
    _17 : verticalScale(17),
    _20 : verticalScale(20),
    _30 : verticalScale(30),
};