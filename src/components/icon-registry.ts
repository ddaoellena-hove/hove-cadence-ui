import { Translate01 } from "./icon-translate";
import { Database01 } from "@untitledui/icons/Database01";
import { LayersThree01 } from "@untitledui/icons/LayersThree01";
import { ShieldTick } from "@untitledui/icons/ShieldTick";
import { Target04 } from "@untitledui/icons/Target04";
import { Activity } from "@untitledui/icons/Activity";
import { AlertCircle } from "@untitledui/icons/AlertCircle";
import { Wifi } from "@untitledui/icons/Wifi";
import { MobilityLignes } from "./icon-mobility";
import { MobilityReseaux } from "./icon-mobility";
import { MobilityCompagnies } from "./icon-mobility";
import { MobilityParcours } from "./icon-mobility";
import { MobilityZones } from "./icon-mobility";
import { MobilityModesCom } from "./icon-mobility";
import { MobilityPoints } from "./icon-mobility";
import { MobilityModesPhy } from "./icon-mobility";
import { InfoPlain } from "./icon-mobility";
/**
 * Registre des icônes du design system.
 *
 * Table de correspondance nom (kebab-case, stable et public) → composant
 * Untitled UI (`@untitledui/icons`). Chaque icône est importée individuellement
 * par sous-chemin pour préserver le tree-shaking — jamais le barrel complet.
 *
 * Cas particuliers (pas d'équivalent 1:1) :
 *   trash     → Trash01
 *   home      → Home01        (home-03 → Home03 reste distinct)
 *   drag-drop → DotsGrid      (cohérent avec le handle du Badge)
 *   icon-90   → ChevronSelectorVertical (sélecteur vertical ↕)
 *   walk      → icône maison (icon-walk.tsx) : pas de piéton chez Untitled UI
 *   anchor    → mode bateau (pas de navire chez Untitled UI)
 */
import type { FC, SVGProps } from "react";
import { AlertTriangle } from "@untitledui/icons/AlertTriangle";
import { Anchor } from "@untitledui/icons/Anchor";
import { AnnotationInfo } from "@untitledui/icons/AnnotationInfo";
import { Announcement01 } from "@untitledui/icons/Announcement01";
import { ArrowDown } from "@untitledui/icons/ArrowDown";
import { ArrowLeft } from "@untitledui/icons/ArrowLeft";
import { ArrowNarrowDownRight } from "@untitledui/icons/ArrowNarrowDownRight";
import { ArrowNarrowUpRight } from "@untitledui/icons/ArrowNarrowUpRight";
import { ArrowRight } from "@untitledui/icons/ArrowRight";
import { ArrowUp } from "@untitledui/icons/ArrowUp";
import { Bank } from "@untitledui/icons/Bank";
import { Bell01 } from "@untitledui/icons/Bell01";
import { Briefcase01 } from "@untitledui/icons/Briefcase01";
import { Building07 } from "@untitledui/icons/Building07";
import { Calendar } from "@untitledui/icons/Calendar";
import { Check } from "@untitledui/icons/Check";
import { CheckCircle } from "@untitledui/icons/CheckCircle";
import { ChevronDown } from "@untitledui/icons/ChevronDown";
import { ChevronLeft } from "@untitledui/icons/ChevronLeft";
import { ChevronRight } from "@untitledui/icons/ChevronRight";
import { ChevronSelectorVertical } from "@untitledui/icons/ChevronSelectorVertical";
import { ChevronUp } from "@untitledui/icons/ChevronUp";
import { Clock } from "@untitledui/icons/Clock";
import { ClockRewind } from "@untitledui/icons/ClockRewind";
import { CodeSnippet02 } from "@untitledui/icons/CodeSnippet02";
import { Copy01 } from "@untitledui/icons/Copy01";
import { DotsGrid } from "@untitledui/icons/DotsGrid";
import { DotsHorizontal } from "@untitledui/icons/DotsHorizontal";
import { Download02 } from "@untitledui/icons/Download02";
import { Edit02 } from "@untitledui/icons/Edit02";
import { Expand02 } from "@untitledui/icons/Expand02";
import { Eye } from "@untitledui/icons/Eye";
import { EyeOff } from "@untitledui/icons/EyeOff";
import { File05 } from "@untitledui/icons/File05";
import { FileAttachment02 } from "@untitledui/icons/FileAttachment02";
import { FilterLines } from "@untitledui/icons/FilterLines";
import { Flag01 } from "@untitledui/icons/Flag01";
import { Folder } from "@untitledui/icons/Folder";
import { Headphones01 } from "@untitledui/icons/Headphones01";
import { Heart } from "@untitledui/icons/Heart";
import { HelpCircle } from "@untitledui/icons/HelpCircle";
import { Home01 } from "@untitledui/icons/Home01";
import { Home03 } from "@untitledui/icons/Home03";
import { InfoCircle } from "@untitledui/icons/InfoCircle";
import { Laptop01 } from "@untitledui/icons/Laptop01";
import { Link01 } from "@untitledui/icons/Link01";
import { List } from "@untitledui/icons/List";
import { Lock01 } from "@untitledui/icons/Lock01";
import { LogIn02 } from "@untitledui/icons/LogIn02";
import { LogOut02 } from "@untitledui/icons/LogOut02";
import { Luggage02 } from "@untitledui/icons/Luggage02";
import { Mail01 } from "@untitledui/icons/Mail01";
import { Map01 } from "@untitledui/icons/Map01";
import { Mark } from "@untitledui/icons/Mark";
import { MarkerPin01 } from "@untitledui/icons/MarkerPin01";
import { MarkerPin06 } from "@untitledui/icons/MarkerPin06";
import { Menu01 } from "@untitledui/icons/Menu01";
import { Microphone01 } from "@untitledui/icons/Microphone01";
import { MicrophoneOff01 } from "@untitledui/icons/MicrophoneOff01";
import { Minus } from "@untitledui/icons/Minus";
import { Monitor04 } from "@untitledui/icons/Monitor04";
import { NavigationPointer01 } from "@untitledui/icons/NavigationPointer01";
import { Phone02 } from "@untitledui/icons/Phone02";
import { Pin02 } from "@untitledui/icons/Pin02";
import { Play } from "@untitledui/icons/Play";
import { Plus } from "@untitledui/icons/Plus";
import { Power01 } from "@untitledui/icons/Power01";
import { Recording01 } from "@untitledui/icons/Recording01";
import { RefreshCcw05 } from "@untitledui/icons/RefreshCcw05";
import { Route } from "@untitledui/icons/Route";
import { Rss01 } from "@untitledui/icons/Rss01";
import { Save01 } from "@untitledui/icons/Save01";
import { SearchMd } from "@untitledui/icons/SearchMd";
import { Send01 } from "@untitledui/icons/Send01";
import { Settings01 } from "@untitledui/icons/Settings01";
import { Settings04 } from "@untitledui/icons/Settings04";
import { Share07 } from "@untitledui/icons/Share07";
import { Star01 } from "@untitledui/icons/Star01";
import { SwitchHorizontal01 } from "@untitledui/icons/SwitchHorizontal01";
import { SwitchVertical01 } from "@untitledui/icons/SwitchVertical01";
import { Terminal } from "@untitledui/icons/Terminal";
import { Trash01 } from "@untitledui/icons/Trash01";
import { Upload02 } from "@untitledui/icons/Upload02";
import { User01 } from "@untitledui/icons/User01";
import { Users01 } from "@untitledui/icons/Users01";
import { VolumeMax } from "@untitledui/icons/VolumeMax";
import { VolumeMin } from "@untitledui/icons/VolumeMin";
import { VolumeX } from "@untitledui/icons/VolumeX";
import { Bus } from "@untitledui/icons/Bus";
import { Train } from "@untitledui/icons/Train";
import { Tram } from "@untitledui/icons/Tram";
import { XClose } from "@untitledui/icons/XClose";
import { Walk } from "./icon-walk";

/** Signature commune d'une icône (évite de fuiter les types privés d'Untitled UI). */
export type IconComponent = FC<SVGProps<SVGSVGElement> & { size?: number; color?: string }>;

export const ICONS = {
  "translate-01": Translate01 as IconComponent,
  "database": Database01 as IconComponent,
  "layers": LayersThree01 as IconComponent,
  "shield-check": ShieldTick as IconComponent,
  "target": Target04 as IconComponent,
  "activity": Activity as IconComponent,
  "alert-circle": AlertCircle as IconComponent,
  "live": Wifi as IconComponent,
  "mobility-lignes": MobilityLignes as IconComponent,
  "mobility-reseaux": MobilityReseaux as IconComponent,
  "mobility-compagnies": MobilityCompagnies as IconComponent,
  "mobility-parcours": MobilityParcours as IconComponent,
  "mobility-zones": MobilityZones as IconComponent,
  "mobility-modes-com": MobilityModesCom as IconComponent,
  "mobility-points": MobilityPoints as IconComponent,
  "mobility-modes-phy": MobilityModesPhy as IconComponent,
  "info-plain": InfoPlain as IconComponent,

  "alert-triangle":            AlertTriangle as IconComponent,
  "anchor":                    Anchor as IconComponent,
  "annotation-info":           AnnotationInfo as IconComponent,
  "announcement-01":           Announcement01 as IconComponent,
  "arrow-down":                ArrowDown as IconComponent,
  "arrow-left":                ArrowLeft as IconComponent,
  "arrow-narrow-down-right":   ArrowNarrowDownRight as IconComponent,
  "arrow-narrow-up-right":     ArrowNarrowUpRight as IconComponent,
  "arrow-right":               ArrowRight as IconComponent,
  "arrow-up":                  ArrowUp as IconComponent,
  "bank":                      Bank as IconComponent,
  "bell-01":                   Bell01 as IconComponent,
  "briefcase-01":              Briefcase01 as IconComponent,
  "building-07":               Building07 as IconComponent,
  "bus":                       Bus as IconComponent,
  "calendar":                  Calendar as IconComponent,
  "check":                     Check as IconComponent,
  "check-circle":              CheckCircle as IconComponent,
  "chevron-down":              ChevronDown as IconComponent,
  "chevron-left":              ChevronLeft as IconComponent,
  "chevron-right":             ChevronRight as IconComponent,
  "chevron-up":                ChevronUp as IconComponent,
  "clock":                     Clock as IconComponent,
  "clock-rewind":              ClockRewind as IconComponent,
  "code-snippet-02":           CodeSnippet02 as IconComponent,
  "copy-01":                   Copy01 as IconComponent,
  "dots-grid":                 DotsGrid as IconComponent,
  "dots-horizontal":           DotsHorizontal as IconComponent,
  "download-02":               Download02 as IconComponent,
  "drag-drop":                 DotsGrid as IconComponent,
  "edit-02":                   Edit02 as IconComponent,
  "expand-02":                 Expand02 as IconComponent,
  "eye":                       Eye as IconComponent,
  "eye-off":                   EyeOff as IconComponent,
  "file-05":                   File05 as IconComponent,
  "file-attachment-02":        FileAttachment02 as IconComponent,
  "filter-lines":              FilterLines as IconComponent,
  "flag-01":                   Flag01 as IconComponent,
  "folder":                    Folder as IconComponent,
  "headphones-01":             Headphones01 as IconComponent,
  "heart":                     Heart as IconComponent,
  "help-circle":               HelpCircle as IconComponent,
  "home":                      Home01 as IconComponent,
  "home-03":                   Home03 as IconComponent,
  "icon-90":                   ChevronSelectorVertical as IconComponent,
  "info-circle":               InfoCircle as IconComponent,
  "laptop-01":                 Laptop01 as IconComponent,
  "link-01":                   Link01 as IconComponent,
  "list":                      List as IconComponent,
  "lock-01":                   Lock01 as IconComponent,
  "log-in-02":                 LogIn02 as IconComponent,
  "log-out-02":                LogOut02 as IconComponent,
  "luggage-02":                Luggage02 as IconComponent,
  "mail-01":                   Mail01 as IconComponent,
  "map-01":                    Map01 as IconComponent,
  "mark":                      Mark as IconComponent,
  "marker-pin-01":             MarkerPin01 as IconComponent,
  "marker-pin-06":             MarkerPin06 as IconComponent,
  "menu-01":                   Menu01 as IconComponent,
  "microphone-01":             Microphone01 as IconComponent,
  "microphone-off-01":         MicrophoneOff01 as IconComponent,
  "minus":                     Minus as IconComponent,
  "monitor-04":                Monitor04 as IconComponent,
  "navigation-pointer-01":     NavigationPointer01 as IconComponent,
  "phone-02":                  Phone02 as IconComponent,
  "pin-02":                    Pin02 as IconComponent,
  "play":                      Play as IconComponent,
  "plus":                      Plus as IconComponent,
  "power-01":                  Power01 as IconComponent,
  "recording-01":              Recording01 as IconComponent,
  "refresh-ccw-05":            RefreshCcw05 as IconComponent,
  "route":                     Route as IconComponent,
  "rss-01":                    Rss01 as IconComponent,
  "save-01":                   Save01 as IconComponent,
  "search-md":                 SearchMd as IconComponent,
  "send-01":                   Send01 as IconComponent,
  "settings-01":               Settings01 as IconComponent,
  "settings-04":               Settings04 as IconComponent,
  "share-07":                  Share07 as IconComponent,
  "star-01":                   Star01 as IconComponent,
  "switch-horizontal-01":      SwitchHorizontal01 as IconComponent,
  "switch-vertical-01":        SwitchVertical01 as IconComponent,
  "terminal":                  Terminal as IconComponent,
  "train":                     Train as IconComponent,
  "tram":                      Tram as IconComponent,
  "trash":                     Trash01 as IconComponent,
  "upload-02":                 Upload02 as IconComponent,
  "user-01":                   User01 as IconComponent,
  "users-01":                  Users01 as IconComponent,
  "volume-max":                VolumeMax as IconComponent,
  "volume-min":                VolumeMin as IconComponent,
  "volume-x":                  VolumeX as IconComponent,
  "walk":                      Walk as IconComponent,
  "x-close":                   XClose as IconComponent,
};

/** Nom d'icône accepté par le composant `Icons`. */
export type IconName = keyof typeof ICONS;
