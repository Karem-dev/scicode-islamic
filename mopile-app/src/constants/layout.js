import { Dimensions } from 'react-native';

export const SCREEN = Dimensions.get('window');

// Floating tab bar dimensions (must match App.js tabBarStyle)
export const TAB_BAR_HEIGHT = 70;
export const TAB_BAR_BOTTOM = 25;

// Minimum paddingBottom for any scrollable list to clear the floating tab bar
// 70 (height) + 25 (bottom offset) + 20 (breathing room) = 115
export const LIST_PADDING_BOTTOM = TAB_BAR_HEIGHT + TAB_BAR_BOTTOM + 20;
