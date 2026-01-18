// Tunable parameters.
// These will not change during runtime.
export const OPTION_CAMERA_NUDGE_ENABLED=true;
export const OPTION_HIDE_HANMARI_ON_NONINTRO_PAGES=false;
export const OPTION_NONINTRO_PAGE_HANMARI_SHRINK_FACTOR=0.8;
export const OPTION_CAMERA_NUDGE_MOUSE_SENSITIVITY=1.0;
export const OPTION_CAMERA_NUDGE_GYRO_SENSITIVITY=1.0;
export const OPTION_STAR_DENSITY_MULTIPLIER=1.0;
export const OPTION_L2D_EYE_FOLLOW_SENSITIVITY=1.0;

export const OPTION_L2D_RANDOM_ACTION_MIN_INTERVAL_SECONDS=5;
export const OPTION_L2D_RANDOM_ACTION_RAND_ADD_SECONDS=5;

export const OPTION_ENABLE_L2D_HANMARI=true;
export const OPTION_ENABLE_ANIMATED_STARS=true;
export const OPTION_ENABLE_FIREWORKS=true;
export const OPTION_ENABLE_L2D_FILTERS=true;

export const OPTION_INTRO_SKY_SCROLL_AMOUNT=300;
export const OPTION_INTRO_FIREWORKS_SCROLL_AMOUNT=500;
export const OPTION_INTRO_CASTLE_SCROLL_AMOUNT=2000;

export const REJECT_UGLY_TRIANGLES=true;
export const UGLY_TRIANGLE_THRESHOLD_ANGLE_DEGREES = 25;

export const SCREEN_MINWIDTH_FOR_STATICBG_LR_IMAGE=1400;

export const OPTION_CASTLEBG_MAX_WIDTH_PIXELS=10000;
export const OPTION_CASTLEBG_MIN_WIDTH_PIXELS=1000;

export const DEBUG_OVERLAY_ACTIVE=false;


const page_transition_duration=800;
export const PAGE_TRANSITION_SPEED_FADEOUT=page_transition_duration/2;
export const PAGE_TRANSITION_SPEED_FADEIN=page_transition_duration/2;
// Castle Enter fade start after castle animation is done
export const STATIC_BG_TRANSITION_SPEED_CASTLE_ENTER=500;
// Castle exit fade starts right away
export const STATIC_BG_TRANSITION_SPEED_CASTLE_EXIT=1000;
// Inside crossfade starts right away.
export const STATIC_BG_TRANSITION_SPEED_INSIDE=page_transition_duration;
