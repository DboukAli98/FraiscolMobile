import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from "react";
import { ViewStyle } from "react-native";



export type ScreenWrapperProps = {
    style? : ViewStyle;
    children: React.ReactNode;
    bg?: string;
};

export interface CustomTabBarProps extends BottomTabBarProps {
  activeTintColor?: string;
  inactiveTintColor?: string;
  backgroundColor?: string;
}



//#region API Interfaces

export interface User {
  id: string;
  name: string;
  email: string;
}


//#endregion