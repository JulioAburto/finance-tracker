import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#173A52",
      light: "#E8F0F5",
      dark: "#0F2A3D",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#147D6F",
      light: "#E5F4F0",
      dark: "#0D5E54",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#F5F7F8",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#17232D",
      secondary: "#62717D",
    },
    divider: "#DDE4E8",
    success: {
      main: "#24845D",
      light: "#E8F5EE",
    },
    warning: {
      main: "#B86E18",
      light: "#FFF3DF",
    },
    error: {
      main: "#C44747",
      light: "#FCEBEB",
    },
    info: {
      main: "#3977A8",
      light: "#EAF2F8",
    },
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily:
      '"Google Sans", Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h4: {
      fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
      fontWeight: 700,
      letterSpacing: "-0.025em",
      lineHeight: 1.2,
    },
    h5: {
      fontWeight: 700,
      letterSpacing: "-0.015em",
    },
    h6: {
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    button: {
      fontWeight: 700,
      textTransform: "none",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#F5F7F8",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 10,
          minHeight: 40,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiCard: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: {
          borderColor: "#DDE4E8",
          boxShadow: "0 8px 24px rgba(23, 58, 82, 0.05)",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: "#62717D",
          backgroundColor: "#F8FAFB",
          fontSize: "0.75rem",
          fontWeight: 800,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 8,
          borderRadius: 999,
        },
        bar: {
          borderRadius: 999,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});
