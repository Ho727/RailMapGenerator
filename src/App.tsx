import React, { useState, useMemo, useEffect, useReducer } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppAppBar from './app-appbar';
import SVGs from './svgs';
import Panels from './panels';
import { getBranches, useTpo, getRoutes } from './methods';
import { CanvasContext, ParamContext, paramReducer } from './context';
import { createMuiTheme, ThemeProvider, useMediaQuery, LinearProgress } from '@material-ui/core';

const darkTheme = createMuiTheme({
    palette: {
        type: 'dark',
        primary: {
            main: '#bb86fc',
        },
        secondary: {
            main: '#018786',
        },
        error: {
            main: '#cf6679',
        },
    },
    // palette: {
    //     type: 'dark',
    //     primary: {
    //         main: '#8ab4f8',
    //     },
    // },
    overrides: {
        MuiDialog: {
            paper: {
                minWidth: 280,
            },
        },
    },
});

const lightTheme = createMuiTheme({
    palette: {
        primary: {
            light: '#bb86fc',
            main: '#6200ee',
        },
        secondary: {
            main: '#018786',
        },
        error: {
            main: '#b00020',
        },
    },
    // palette: {
    //     primary: {
    //         main: '#1a73e8',
    //     },
    //     text: {
    //         primary: '#202124',
    //         secondary: '#5f6368',
    //     },
    // },
    overrides: {
        MuiDialog: {
            paper: {
                minWidth: 280,
            },
        },
    },
});

export default function App() {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const theme = prefersDarkMode ? darkTheme : lightTheme;

    const [canvasAvailable, setCanvasAvailable] = useState<ProvidedCanvas[]>([]);
    const [canvasToShown, setCanvasToShown] = useState<'all' | ProvidedCanvas>(localStorage.rmgCanvas);
    useEffect(() => localStorage.setItem('rmgCanvas', canvasToShown), [canvasToShown]);
    const [canvasScale, setCanvasScale] = useState(
        Number(localStorage.rmgScale) >= 0.1 ? Number(localStorage.rmgScale) : 1
    );
    useEffect(() => localStorage.setItem('rmgScale', canvasScale.toFixed(1)), [canvasScale]);

    return (
        <BrowserRouter basename={process.env.PUBLIC_URL}>
            <ThemeProvider theme={theme}>
                <CanvasContext.Provider
                    value={{
                        rmgStyle: window.location.pathname.split('/')[2] as ProvidedStyles,
                        canvasAvailable,
                        setCanvasAvailable,
                        canvasToShown,
                        setCanvasToShown,
                        canvasScale,
                        setCanvasScale,
                    }}
                >
                    <React.Suspense fallback={<LinearProgress />}>
                        <AppAppBar />
                    </React.Suspense>
                    <AppBody />
                </CanvasContext.Provider>
            </ThemeProvider>
        </BrowserRouter>
    );
}

const AppBody = () => {
    const [param, dispatch] = useReducer(paramReducer, JSON.parse(localStorage.rmgParam) as RMGParam);
    const paramString = JSON.stringify(param);
    useEffect(() => localStorage.setItem('rmgParam', paramString), [paramString]);

    const deps = Object.keys(param.stn_list).reduce(
        (acc, cur) =>
            acc +
            cur +
            ((...k: (keyof StationInfo)[]) => (o: StationInfo) => k.reduce((a, c) => a + JSON.stringify(o[c]), ''))(
                'parents',
                'children',
                'branch'
            )(param.stn_list[cur]),
        ''
    );

    const branches = useMemo(
        () => getBranches(param.stn_list),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [deps]
    );
    const routes = useMemo(
        () => getRoutes(param.stn_list),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [deps]
    );
    const tpo = useTpo(branches);

    return (
        <>
            <ParamContext.Provider
                value={{
                    param,
                    dispatch,
                    branches,
                    routes,
                    deps,
                    tpo,
                }}
            >
                <div style={{ overflowY: 'auto' }}>
                    <SVGs />
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <Panels />
                </div>
            </ParamContext.Provider>
            <canvas style={{ display: 'none' }} />
        </>
    );
};
