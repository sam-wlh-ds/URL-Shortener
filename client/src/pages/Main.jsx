import React, { useState } from "react";
import { backend } from "../global/variables";
import {
    Box,
    TextField,
    Typography,
    Button,
    CircularProgress,
    InputAdornment,
    IconButton,
    Snackbar,
    Alert,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LinkIcon from "@mui/icons-material/Link";
import { ThemeProvider } from "@mui/material/styles";
import theme from '../theme';

const App = () => {
    const [longUrl, setLongUrl] = useState("");
    const [shortenedUrl, setShortenedUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

    const handleShortenUrl = async () => {
        if (!longUrl) {
            setError("Please enter a URL.");
            return;
        }

        setLoading(true);
        setError("");
        setShortenedUrl("");

        try {
            //  Backend endpoint
            const response = await fetch(`${backend}/shorten`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url: longUrl }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                // console.log(errorData);
                let errorMessage = "Failed to shorten URL.";
                if (errorData.message) {
                    errorMessage = errorData.message;
                } else if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
                    errorMessage = errorData.errors.map(err => err.msg).join('; ');
                } else {
                    errorMessage = `Server error: ${response.status}`;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            //   console.log("Backend data received:", data);
            //   console.log("Short URL from backend:", data.shortUrl);

            setShortenedUrl(`${backend}/${data.shortUrl}`); // Construct full short URL
            setSnackbarMessage(data.message || "URL shortened successfully!");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
        } catch (err) {
            console.error("Error shortening URL:", err);
            setError(err.message);
            setSnackbarMessage(`Error: ${err.message}`);
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyShortUrl = () => {
        if (shortenedUrl) {
            const textField = document.createElement("textarea");
            textField.innerText = shortenedUrl;
            document.body.appendChild(textField);
            textField.select();
            document.execCommand("copy");
            textField.remove();

            setSnackbarMessage("Short URL copied to clipboard!");
            setSnackbarSeverity("info");
            setSnackbarOpen(true);
        }
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setSnackbarOpen(false);
    };

    return (
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "100vh",
                    backgroundColor: theme.palette.background.default,
                    padding: 2,
                }}
            >
                <Box
                    sx={{
                        backgroundColor: "white",
                        padding: { xs: 3, sm: 5 },
                        borderRadius: 3,
                        boxShadow: 3,
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                        width: "100%",
                        maxWidth: 500,
                        textAlign: "center",
                    }}
                >
                    <Typography variant="h4" component="h1" gutterBottom>
                        <LinkIcon sx={{ verticalAlign: "middle", mr: 1 }} /> URL
                        Shortener
                    </Typography>
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                    >
                        Paste your long URL below to get a short, shareable
                        link.
                    </Typography>

                    <TextField
                        label="Enter your long URL here"
                        variant="outlined"
                        fullWidth
                        value={longUrl}
                        onChange={(e) => setLongUrl(e.target.value)}
                        error={!!error}
                        helperText={error}
                        disabled={loading}
                        sx={{ mb: 2 }}
                    />

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleShortenUrl}
                        disabled={loading || !longUrl}
                        sx={{ height: 56 }}
                    >
                        {loading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            "Shorten Link"
                        )}
                    </Button>

                    {shortenedUrl && (
                        <TextField
                            label="Your Shortened URL"
                            variant="outlined"
                            fullWidth
                            value={shortenedUrl}
                            InputProps={{
                                readOnly: true,
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={handleCopyShortUrl}
                                            edge="end"
                                            aria-label="copy short URL"
                                        >
                                            <ContentCopyIcon />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mt: 3 }}
                        />
                    )}
                </Box>
            </Box>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbarSeverity}
                    sx={{ width: "100%" }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </ThemeProvider>
    );
};

export default App;
