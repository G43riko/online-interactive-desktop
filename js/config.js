/*R*/const LEFT_BUTTON	= 0;
/*R*/const RIGHT_BUTTON	= 2;
/*R*/const SHIFT_KEY	= 16;
/*R*/const L_CTRL_KEY	= 17;
/*R*/const L_ALT_KEY	= 18;
/*R*/const ESCAPE_KEY	= 27;
/*R*/const ENTER_KEY	= 13;
/*R*/const Z_KEY		= 90;
/*R*/const Y_KEY		= 89;
/*R*/const DELETE_KEY	= 46;
/*R*/const A_KEY		= 65;

const FPS = 60;

const FONT_HALIGN_LEFT		= "left";
const FONT_HALIGN_CENTER	= "center";
const FONT_HALIGN_RIGHT		= "right";

const FONT_VALIGN_MIDDLE	= "middle";
const FONT_VALIGN_TOP		= "top";
const FONT_VALIGN_ALPHA		= "alphabetic";
const FONT_VALIGN_HANG		= "hanging";
const FONT_VALIGN_IDEO		= "ideographic";
const FONT_VALIGN_BOTT		= "bottom";

const FONT_ALIGN_CENTER = 10;
const FONT_ALIGN_NORMAL = 11;

const FOLDER_IMAGE	= "/img";
const FOLDER_JSON	= "/js/json";

const SELECTOR_SIZE			= 10;
const SELECTOR_COLOR		= "orange";
const SELECTOR_BORDER_COLOR	= "black";

const LINE_CAP_BUTT		= "butt";
const LINE_CAP_ROUND	= "round";
const LINE_CAP_SQUARE	= "square";

const LINE_JOIN_MITER	= "miter";
const LINE_JOIN_ROUND	= "round";
const LINE_JOIN_BEVEL	= "bevel";


const OPERATION_DRAW_RECT	= 1000;
const OPERATION_DRAW_ARC	= 1001;
const OPERATION_DRAW_PATH	= 1002;
const OPERATION_DRAW_LINE	= 1003;
const OPERATION_DRAW_JOIN	= 1004;
const OPERATION_DRAW_IMAGE	= 1005;
const OPERATION_RUBBER		= 1006;
const OPERATION_AREA		= 1007;

const JOIN_LINEAR		= 2000;
const JOIN_BAZIER		= 2001;
const JOIN_SEQUENCAL	= 2002;

const LINE_STYLE_NORMAL		= 2100;
const LINE_STYLE_STRIPPED	= 2101;
const LINE_STYLE_FILLED		= 2102;

/*
 * NIKINE
 * #CCC51C
 * #FFE600
 * #F05A28
 * #B6006C
 * #3A0256
 *
 * KIKINE
 * #B1EB00
 * #53BBF4
 * #FF85CB
 * #FF432E
 * #FFAC00
 */


const DEFAULT_BACKGROUND_COLOR	= "#ffffff";
/*R*/const DEFAULT_FONT			= "Comic Sans MS";
const DEFAULT_FONT_SIZE			= 22;
const DEFAULT_FONT_COLOR		= "#000000";
const DEFAULT_SHADOW_COLOR		= "#000000";
const DEFAULT_SHADOW_BLUR		= 20;
const DEFAULT_SHADOW_OFFSET		= 5;
/*D*/const DEFAUL_STROKE_COLOR	= "#000000";
/*D*/const DEFAULT_STROKE_WIDTH	= 2;
/*D*/const DEFAULT_COLOR		= "#000000";
const DEFAULT_FILL_COLOR		= "#000000";
const DEFAULT_RADIUS			= 5;
const DEFAULT_TEXT_OFFSET		= 5;
const DEFAULT_FONT_HALIGN		= FONT_HALIGN_LEFT;
const DEFAULT_FONT_VALIGN		= FONT_VALIGN_TOP;
/*D*/const DEFAULT_ROUND_VAL			= 10;
const DEFAULT_BORDER_COLOR		= "#000000";
const DEFAULT_BORDER_WIDTH		= 2;
const DEFAULT_LINE_TYPE			= JOIN_LINEAR;
const DEFAULT_LINE_STYLE		= LINE_STYLE_NORMAL;
const DEFAULT_BRUSH_SIZE		= 20;
const DEFAULT_BRUSH_TYPE		= "line";
const DEFAULT_BRUSH_COLOR		= "#000000";
const DEFAULT_LAYER_TITLE		= "default";
const DEFAULT_USER_NAME		= "DEFAULT_NAME";

const CONTEXT_MENU_LINE_HEIGHT		= 40;
const CONTEXT_MENU_FONT_COLOR		= DEFAULT_FONT_COLOR;
const CONTEXT_MENU_OFFSET 			= 10;
const CONTEXT_MENU_WIDTH 			= 240;
const CONTEXT_FILL_COLOR			= "#1abc9c";
const CONTEXT_DISABLED_FILL_COLOR	= "#abd6bb";
const CONTEXT_SELECTED_FILL_COLOR	= "red";

const GRID_COLOR	= "Black";
const GRID_WIDTH	= 0.1;
const GRID_DIST		= 10;
const GRID_NTH_BOLD	= 5;

const TOUCH_DURATION	= 500;
const TOUCH_VARIATION	= 5;

const MENU_OFFSET 				= 10;//20
const MENU_RADIUS				= 10;
const MENU_BORDER_WIDTH 		= 2;
const MENU_FONT_COLOR 			= "#000000";
const MENU_BORDER_COLOR 		= "#000000";
const MENU_WIDTH 				= 50;//60
const MENU_HEIGHT				= 50;//60
const MENU_POSITION				= MENU_OFFSET;
const MENU_BACKGROUND_COLOR		= "#1abc9c";
const MENU_DISABLED_BG_COLOR	= "#abd6bb";

const TABLE_BORDER_WIDTH	= 1;
const TABLE_HEADER_COLOR	= "#53cfff";
const TABLE_BODY_COLOR		= "#5bf2ff";
const TABLE_LINE_HEIGHT		= 40;
const TABLE_BORDER_COLOR	= "#000000";
const TABLE_WIDTH 			= 300;
const TABLE_RADIUS			= 10;
const TABLE_TEXT_OFFSET		= 5;

const TIMELINE_HEIGHT				= 60;
const TIMELINE_SLIDER_HEIGHT		= 5;
const TIMELINE_SLIDER_COLOR			= "purple";
const TIMELINE_SLIDER_OFFSET		= 30;
const TIMELINE_BUTTON_SIZE			= 20;
const TIMELINE_BUTTON_COLOR			= "HotPink";
const TIMELINE_BUTTON_BORDER_COLOR	= "IndianRed";

const ACCESS_PUBLIC		= "+";
const ACCESS_PRIVATE	= "-";
const ACCESS_PROTECTED	= "#";

const ACTION_OBJECT_MOVE 		= 2310;
const ACTION_OBJECT_CREATE		= 2311;
const ACTION_OBJECT_CHANGE		= 2312;
const ACTION_OBJECT_DELETE		= 2313;
const ACTION_PAINT_CLEAN		= 2314;
const ACTION_PAINT_ADD_POINT	= 2315;
const ACTION_PAINT_BREAK_LINE	= 2316;
const ACTION_PAINT_CHANGE_BRUSH	= 2317;
const ACTION_LAYER_CREATE 		= 2318;
const ACTION_LAYER_DELETE 		= 2319;
const ACTION_LAYER_CLEAN 		= 2320;
const ACTION_LAYER_VISIBLE 		= 2321;
const ACTION_LAYER_RENAME 		= 2322;

const PAINT_ACTION_BRUSH	= 2400;
const PAINT_ACTION_LINE		= 2401;
/*
	compatible: 14.9.2016
*/
const KEYWORD_OBJECT		= "object";
const KEYWORD_STRING		= "string";
const KEYWORD_NUMBER		= "number";
const KEYWORD_BOOLEAN		= "boolean";
const KEYWORD_FUNCTION		= "function";
const KEYWORD_UNDEFINED		= "undefined";
const KEYWORD_TRANSPARENT	= "transparent";
/*R*/const PI2 = Math.PI * 2;

/*R*/const IMAGE_FORMAT_JPG	= "image/jpeg";
/*R*/const IMAGE_FORMAT_PNG	= "image/png";
/*R*/const IMAGE_FORMAT_GIF	= "image/gif";
const FORMAT_FILE_XML	= "text/xml";

const ATTRIBUTE_FILL_COLOR		= "fillColor";
const ATTRIBUTE_BORDER_COLOR	= "borderColor";
const ATTRIBUTE_BORDER_WIDTH	= "borderWidth";
const ATTRIBUTE_LINE_WIDTH		= "lineWidth";
const ATTRIBUTE_FONT_SIZE		= "fontSize";
const ATTRIBUTE_FONT_COLOR		= "fontColor";
const ATTRIBUTE_LINE_TYPE		= "lineType";
const ATTRIBUTE_LINE_STYLE		= "lineStyle";
const ATTRIBUTE_BRUSH_SIZE		= "brushSize";
const ATTRIBUTE_BRUSH_TYPE		= "brushType";
const ATTRIBUTE_BRUSH_COLOR		= "brushColor";
const ATTRIBUTE_RADIUS			= "radius";

const INPUT_TYPE_CHECKBOX	= "checkbox";
const INPUT_TYPE_RADIO		= "radio";

const CHECKBOX_COLOR_TRUE	= "green";
const CHECKBOX_COLOR_FALSE	= "red";

const COMPONENT_DRAW	= "a";
const COMPONENT_SHARE	= "b";
/*D*/const COMPONENT_WATCH	= "c";
const COMPONENT_TOOLS	= "d";
const COMPONENT_LOAD	= "e";
const COMPONENT_SCREEN	= "f";
const COMPONENT_CONTENT	= "g";
const COMPONENT_EDIT	= "h";
const COMPONENT_SAVE	= "i";
const COMPONENT_LAYERS	= "j";
const COMPONENT_TASK	= "k";


const LAYERS_LINE_HEIGHT	= 50;
const LAYERS_PANEL_WIDTH	= 180;
const LAYERS_PANEL_OFFSET	= 40;
const LAYERS_FONT_SIZE		= 20;
const LAYERS_CHECKBOX_SIZE	= 30;
const LAYERS_BUTTON_SIZE	= 40;

const LOGGER_MENU_CLICK			= 2600;
const LOGGER_CREATOR_CHANGE		= 2601;
const LOGGER_CONTEXT_CLICK		= 2602;
const LOGGER_OBJECT_CREATED		= 2604;
const LOGGER_OBJECT_ADDED		= 2605;
const LOGGER_OBJECT_CLEANED		= 2609;
const LOGGER_COMPONENT_CREATE	= 2606;
const LOGGER_PAINT_HISTORY		= 2607;
const LOGGER_PAINT_ACTION		= 2608;
const LOGGER_MOUSE_EVENT		= 2610;
const LOGGER_KEY_EVENT			= 2611;
const LOGGER_DRAW				= 2612;		
const LOGGER_CHANGE_OPTION		= 2613;	
const LOGGER_LAYER_CHANGE		= 2603;
const LOGGER_LAYER_CLEANED		= 2614;
const LOGGER_LAYER_RENAMED		= 2615;
const LOGGER_LAYER_RASTERED		= 2616;

const HIGHTLIGHT_CORRECT	= 2700;
const HIGHTLIGHT_WRONG		= 2701;

const LAYER_USER	= 2710;
const LAYER_GUI		= 2711;
const LAYER_TASK	= 2712;


const STATUS_CONNECTED		= 2720;
const STATUS_DISCONNECTED	= 2721;

const OBJECT_ARC		= "Arc";
const OBJECT_ARROW		= "Arrow";
const OBJECT_CLASS		= "Class";
const OBJECT_CONNECTOR	= "Connector";
const OBJECT_IMAGE		= "Image";
const OBJECT_JOIN		= "Join";
const OBJECT_LINE		= "Line";
const OBJECT_PAINT		= "Paint";
const OBJECT_POLYGON	= "Polygon";
const OBJECT_RECT		= "Rect";
const OBJECT_TABLE		= "Table";
const OBJECT_INPUT		= "Input";
const OBJECT_TEXT		= "Text";
const OBJECT_GRAPH		= "Graph";
const OBJECT_RUBBER		= "Rubber";
const OBJECT_AREA		= "Area";

const CURSOR_POINTER	= "pointer";
const CURSOR_DEFAULT	= "default";
const CURSOR_NOT_ALLOWED	= "not-allowed";

const OPTION_CHANGE_CURSOR		= true;
const OPTION_MOVING_SILHOUETTE	= false;
const OPTION_SHOW_SHADOWS		= true;
const OPTION_CANVAS_BLUR		= false;
const OPTION_SHOW_LAYERS_VIEWER	= true;
const OPTION_SHOW_GRID			= true;

const LINE_NONE				= 2210;
const LINE_ARROW_CLASSIC	= 2211;
const LINE_ARROW_CLOSED		= 2212;
const LINE_ARROW_FILLED		= 2213;
const LINE_DIAMOND_CLASSIC	= 2214;
const LINE_DIAMOND_FILLED	= 2215;

const ACTION_MOUSE_MOVE			= 2318;
const ACTION_MOUSE_DOWN			= 2319;
const ACTION_MOUSE_UP			= 2320;
const ACTION_KEY_DOWN			= 2321;
const ACTION_KEY_UP				= 2322;
const ACTION_PAINT_ADD_PATH		= 2323;
const ACTION_PAINT_REMOVE_PATH	= 2324;

const MSG_DIVIDER = "########";

const MSG_CONN_RECONNECT	= "Spojenie zo serverom bolo uspešne znovunadviazané";
const MSG_CONN_CONFIRM		= "jupíííí spojenie bolo úspešné";
const MSG_CONN_FAILED		= "Nepodarilo sa nadviazať spojenie zo serverom";
const MSG_CONN_ERROR		= "Spojenie zo serverom bolo prerušené";
const MSG_CONN_DISCONNECT	= "Spojenie zo serverom bolo úspešne ukončené";
const MSG_USER_CONNECT		= "používatel " + MSG_DIVIDER + "[" + MSG_DIVIDER + "] sa pripojil";

function getMessage(text){
	if(!arguments.length)
		return text;


	for(var i=1 ; i<arguments.length ; i++)
		text = text.replace(MSG_DIVIDER, arguments[i]);

	return text;
}