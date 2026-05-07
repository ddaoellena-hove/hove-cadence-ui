import "./icons.css";

export interface IconsProps {
  /** Icon name or icon-related value. */
  icon:
    | "alert-triangle"
    | "annotation-info"
    | "announcement-01"
    | "arrow-down"
    | "arrow-left"
    | "arrow-narrow-down-right"
    | "arrow-narrow-up-right"
    | "arrow-right"
    | "arrow-up"
    | "bank"
    | "bell-01"
    | "briefcase-01"
    | "building-07"
    | "calendar"
    | "check"
    | "check-circle"
    | "chevron-down"
    | "chevron-left"
    | "chevron-right"
    | "chevron-up"
    | "clock"
    | "clock-rewind"
    | "code-snippet-02"
    | "copy-01"
    | "dots-grid"
    | "dots-horizontal"
    | "download-02"
    | "drag-drop"
    | "edit-02"
    | "expand-02"
    | "eye"
    | "eye-off"
    | "file-05"
    | "file-attachment-02"
    | "filter-lines"
    | "flag-01"
    | "folder"
    | "headphones-01"
    | "heart"
    | "help-circle"
    | "home"
    | "home-03"
    | "icon-90"
    | "info-circle"
    | "laptop-01"
    | "link-01"
    | "list"
    | "lock-01"
    | "log-in-02"
    | "log-out-02"
    | "luggage-02"
    | "mail-01"
    | "map-01"
    | "mark"
    | "marker-pin-01"
    | "marker-pin-06"
    | "menu-01"
    | "microphone-01"
    | "microphone-off-01"
    | "minus"
    | "monitor-04"
    | "navigation-pointer-01"
    | "phone-02"
    | "pin-02"
    | "play"
    | "plus"
    | "power-01"
    | "recording-01"
    | "refresh-ccw-05"
    | "route"
    | "rss-01"
    | "save-01"
    | "search-md"
    | "send-01"
    | "settings-01"
    | "settings-04"
    | "share-07"
    | "star-01"
    | "switch-horizontal-01"
    | "switch-vertical-01"
    | "terminal"
    | "trash"
    | "upload-02"
    | "user-01"
    | "users-01"
    | "volume-max"
    | "volume-min"
    | "volume-x"
    | "x-close";

  /** Optional class name for custom styling. */
  className: string;

  /** Icon name or icon-related value. */
  iconMap: string;
}

export const Icons = ({
  icon: iconProp = "search-md",
  className,
  iconMap = "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-map-01-1_1.svg",
}: IconsProps) => {
  const icon = iconProp as string;
  return (
    <img
      className={`icons ${className}`}
      alt="Icon search md"
      src={
        icon === "search-md"
          ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-search-md-1_1.svg"
          : icon === "log-out-02"
            ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-log-out-02-1_1.svg"
            : icon === "chevron-up"
              ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-chevron-up-1_1.svg"
              : icon === "settings-01"
                ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-settings-01-1_1.svg"
                : icon === "log-in-02"
                  ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-log-in-02-1_1.svg"
                  : icon === "chevron-down"
                    ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-chevron-down-1_1.svg"
                    : icon === "settings-04"
                      ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-settings-04-1_1.svg"
                      : icon === "user-01"
                        ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-user-01-1_1.svg"
                        : icon === "chevron-left"
                          ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-chevron-left-1_1.svg"
                          : icon === "copy-01"
                            ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-copy-01-1_1.svg"
                            : icon === "users-01"
                              ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-users-01-1_1.svg"
                              : icon === "chevron-right"
                                ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-chevron-right-1_1.svg"
                                : icon === "icon-90"
                                  ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-icon90-2_1.svg"
                                  : icon === "save-01"
                                    ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-save-01-1_1.svg"
                                    : icon === "plus"
                                      ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-plus-1_1.svg"
                                      : icon === "arrow-up"
                                        ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-arrow-up-1_1.svg"
                                        : icon === "edit-02"
                                          ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-edit-02-1_1.svg"
                                          : icon === "minus"
                                            ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-minus-1_1.svg"
                                            : icon === "arrow-down"
                                              ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-arrow-down-1_1.svg"
                                              : icon === "trash"
                                                ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-trash-1_1.svg"
                                                : icon === "x-close"
                                                  ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-x-close-1_1.svg"
                                                  : icon === "arrow-left"
                                                    ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-arrow-left-1_1.svg"
                                                    : icon === "home"
                                                      ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-home-1_1.svg"
                                                      : icon === "check"
                                                        ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-check-1_1.svg"
                                                        : icon === "arrow-right"
                                                          ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-arrow-right-1_1.svg"
                                                          : icon === "heart"
                                                            ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-heart-1_1.svg"
                                                            : icon === "eye"
                                                              ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-eye-1_1.svg"
                                                              : icon ===
                                                                  "switch-horizontal-01"
                                                                ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-switch-horizontal-01-1_1.svg"
                                                                : icon ===
                                                                    "star-01"
                                                                  ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-star-01-1_1.svg"
                                                                  : icon ===
                                                                      "eye-off"
                                                                    ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-eye-off-1_1.svg"
                                                                    : icon ===
                                                                        "switch-vertical-01"
                                                                      ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-switch-vertical-01-1_1.svg"
                                                                      : icon ===
                                                                          "file-05"
                                                                        ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-file-05-1_1.svg"
                                                                        : icon ===
                                                                            "help-circle"
                                                                          ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-help-circle-1_1.svg"
                                                                          : icon ===
                                                                              "expand-02"
                                                                            ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-expand-02-2_1.svg"
                                                                            : icon ===
                                                                                "folder"
                                                                              ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-folder-1_1.svg"
                                                                              : icon ===
                                                                                  "check-circle"
                                                                                ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-check-circle-1_1.svg"
                                                                                : icon ===
                                                                                    "expand-02"
                                                                                  ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-expand-02-3_1.svg"
                                                                                  : icon ===
                                                                                      "refresh-ccw-05"
                                                                                    ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-refresh-ccw-05-1_1.svg"
                                                                                    : icon ===
                                                                                        "arrow-narrow-down-right"
                                                                                      ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-arrow-narrow-down-right-1_1.svg"
                                                                                      : icon ===
                                                                                          "file-attachment-02"
                                                                                        ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-file-attachment-02-1_1.svg"
                                                                                        : icon ===
                                                                                            "arrow-narrow-up-right"
                                                                                          ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-arrow-narrow-up-right-1_1.svg"
                                                                                          : icon ===
                                                                                              "calendar"
                                                                                            ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-calendar-1_1.svg"
                                                                                            : icon ===
                                                                                                "map-01"
                                                                                              ? iconMap
                                                                                              : icon ===
                                                                                                  "clock"
                                                                                                ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-clock-1_1.svg"
                                                                                                : icon ===
                                                                                                    "marker-pin-01"
                                                                                                  ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-marker-pin-01-1_1.svg"
                                                                                                  : icon ===
                                                                                                      "clock-rewind"
                                                                                                    ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-clock-rewind-1_1.svg"
                                                                                                    : icon ===
                                                                                                        "mark"
                                                                                                      ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-mark-1_1.svg"
                                                                                                      : icon ===
                                                                                                          "alert-triangle"
                                                                                                        ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-alert-triangle-1_1.svg"
                                                                                                        : icon ===
                                                                                                            "menu-01"
                                                                                                          ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-menu-01-1_1.svg"
                                                                                                          : icon ===
                                                                                                              "building-07"
                                                                                                            ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-building-07-1_1.svg"
                                                                                                            : icon ===
                                                                                                                "bell-01"
                                                                                                              ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-bell-01-1_1.svg"
                                                                                                              : icon ===
                                                                                                                  "dots-horizontal"
                                                                                                                ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-dots-horizontal-1_1.svg"
                                                                                                                : icon ===
                                                                                                                    "bank"
                                                                                                                  ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-bank-1_1.svg"
                                                                                                                  : icon ===
                                                                                                                      "headphones-01"
                                                                                                                    ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-headphones-01-1_1.svg"
                                                                                                                    : icon ===
                                                                                                                        "filter-lines"
                                                                                                                      ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-filter-lines-1_1.svg"
                                                                                                                      : icon ===
                                                                                                                          "navigation-pointer-01"
                                                                                                                        ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-navigation-pointer-01-1_1.svg"
                                                                                                                        : icon ===
                                                                                                                            "laptop-01"
                                                                                                                          ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-laptop-01-1_1.svg"
                                                                                                                          : icon ===
                                                                                                                              "download-02"
                                                                                                                            ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-download-02-1_1.svg"
                                                                                                                            : icon ===
                                                                                                                                "home-03"
                                                                                                                              ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-home-03-1_1.svg"
                                                                                                                              : icon ===
                                                                                                                                  "monitor-04"
                                                                                                                                ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-monitor-04-1_1.svg"
                                                                                                                                : icon ===
                                                                                                                                    "upload-02"
                                                                                                                                  ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-upload-02-1_1.svg"
                                                                                                                                  : icon ===
                                                                                                                                      "briefcase-01"
                                                                                                                                    ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-briefcase-01-1_1.svg"
                                                                                                                                    : icon ===
                                                                                                                                        "phone-02"
                                                                                                                                      ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-phone-02-1_1.svg"
                                                                                                                                      : icon ===
                                                                                                                                          "mail-01"
                                                                                                                                        ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-mail-01-1_1.svg"
                                                                                                                                        : icon ===
                                                                                                                                            "marker-pin-06"
                                                                                                                                          ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-marker-pin-06-1_1.svg"
                                                                                                                                          : icon ===
                                                                                                                                              "power-01"
                                                                                                                                            ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-power-01-1_1.svg"
                                                                                                                                            : icon ===
                                                                                                                                                "lock-01"
                                                                                                                                              ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-lock-01-1_1.svg"
                                                                                                                                              : icon ===
                                                                                                                                                  "flag-01"
                                                                                                                                                ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-flag-01-1_1.svg"
                                                                                                                                                : icon ===
                                                                                                                                                    "code-snippet-02"
                                                                                                                                                  ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-code-snippet-02-1_1.svg"
                                                                                                                                                  : icon ===
                                                                                                                                                      "share-07"
                                                                                                                                                    ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-share-07-1_1.svg"
                                                                                                                                                    : icon ===
                                                                                                                                                        "route"
                                                                                                                                                      ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-route-1_1.svg"
                                                                                                                                                      : icon ===
                                                                                                                                                          "volume-max"
                                                                                                                                                        ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-volume-max-1_1.svg"
                                                                                                                                                        : icon ===
                                                                                                                                                            "link-01"
                                                                                                                                                          ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-link-01-1_1.svg"
                                                                                                                                                          : icon ===
                                                                                                                                                              "rss-01"
                                                                                                                                                            ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-rss-01-1_1.svg"
                                                                                                                                                            : icon ===
                                                                                                                                                                "volume-min"
                                                                                                                                                              ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-volume-min-1_1.svg"
                                                                                                                                                              : icon ===
                                                                                                                                                                  "send-01"
                                                                                                                                                                ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-send-01-1_1.svg"
                                                                                                                                                                : icon ===
                                                                                                                                                                    "luggage-02"
                                                                                                                                                                  ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-luggage-02-1_1.svg"
                                                                                                                                                                  : icon ===
                                                                                                                                                                      "volume-x"
                                                                                                                                                                    ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-volume-x-1_1.svg"
                                                                                                                                                                    : icon ===
                                                                                                                                                                        "pin-02"
                                                                                                                                                                      ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-pin-02-1_1.svg"
                                                                                                                                                                      : icon ===
                                                                                                                                                                          "microphone-01"
                                                                                                                                                                        ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-microphone-01-1_1.svg"
                                                                                                                                                                        : icon ===
                                                                                                                                                                            "info-circle"
                                                                                                                                                                          ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-info-circle-1_1.svg"
                                                                                                                                                                          : icon ===
                                                                                                                                                                              "microphone-off-01"
                                                                                                                                                                            ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-microphone-off-01-1_1.svg"
                                                                                                                                                                            : icon ===
                                                                                                                                                                                "dots-grid"
                                                                                                                                                                              ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-dots-grid-1_1.svg"
                                                                                                                                                                              : icon ===
                                                                                                                                                                                  "play"
                                                                                                                                                                                ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-play-1_1.svg"
                                                                                                                                                                                : icon ===
                                                                                                                                                                                    "drag-drop"
                                                                                                                                                                                  ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-drag-drop-1_1.svg"
                                                                                                                                                                                  : icon ===
                                                                                                                                                                                      "recording-01"
                                                                                                                                                                                    ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-recording-01-1_1.svg"
                                                                                                                                                                                    : icon ===
                                                                                                                                                                                        "list"
                                                                                                                                                                                      ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-list-1_1.svg"
                                                                                                                                                                                      : icon ===
                                                                                                                                                                                          "announcement-01"
                                                                                                                                                                                        ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-announcement-01-1_1.svg"
                                                                                                                                                                                        : icon ===
                                                                                                                                                                                            "annotation-info"
                                                                                                                                                                                          ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-annotation-info-1_1.svg"
                                                                                                                                                                                          : icon ===
                                                                                                                                                                                              "icon-90"
                                                                                                                                                                                            ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-icon90-3_1.svg"
                                                                                                                                                                                            : icon ===
                                                                                                                                                                                                "terminal"
                                                                                                                                                                                              ? "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-terminal-1_1.svg"
                                                                                                                                                                                              : undefined
      }
    />
  );
};
