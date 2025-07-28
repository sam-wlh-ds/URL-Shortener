import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  CircularProgress,
  Grid,
  Paper,
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import AnalyticsIcon from '@mui/icons-material/Analytics'; // For page title icon
import { ThemeProvider } from "@mui/material/styles";
import UrlCard from "../components/UrlCard";
import { backend } from "../global/variables";
import theme from '../theme';

const AnalyticsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchedUrl, setSearchedUrl] = useState(null);
  const [topUrls, setTopUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Function to fetch top URLs
  const fetchTopUrls = async () => {
    setLoading(true);
    setError("");
    setSearchedUrl(null);

    try {
      const response = await fetch(`${backend}/analytics/top`); 
      if (!response.ok) {
        throw new Error(`Failed to fetch top URLs: ${response.statusText}`);
      }
      const data = await response.json();
      setTopUrls(data.slice(0, 6)); // Display top 6 as per image
    } catch (err) {
      console.error("Error fetching top URLs:", err);
      setError(err.message || "Failed to load top URLs.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSearchedUrl = async () => {
    if (!searchTerm.trim()) {
      fetchTopUrls();
      return;
    }

    setLoading(true);
    setError("");
    setTopUrls([]);

    try {
    //   console.log(searchTerm);
      const response = await fetch(`${backend}/analytics/search?shortUrl=${searchTerm.trim()}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "URL not found." }));
        throw new Error(errorData.message || `Failed to find URL: ${response.statusText}`);
      }
      const data = await response.json();
      setSearchedUrl(data);
    } catch (err) {
      console.error("Error fetching searched URL:", err);
      setError(err.message || "Failed to find URL.");
      setSearchedUrl(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopUrls();
  }, []);

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
          padding: 3,
        }}
      >
        <Paper
          sx={{
            backgroundColor: "white",
            padding: { xs: 3, sm: 5 },
            borderRadius: 3,
            boxShadow: 3,
            display: "flex",
            flexDirection: "column",
            gap: 3,
            width: "100%",
            maxWidth: 800,
            textAlign: "center",
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AnalyticsIcon sx={{ fontSize: 40, mr: 1, color: theme.palette.primary.main }} />
            URL Analytics
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, width: '100%', mb: 4 }}>
            <TextField
              label="Search by Short URL"
              variant="outlined"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  fetchSearchedUrl();
                }
              }}
              disabled={loading}
              sx={{ borderRadius: 8 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={fetchSearchedUrl}
              disabled={loading}
              sx={{ borderRadius: 8, minWidth: 'auto', px: 3 }}
            >
              <SearchIcon />
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" variant="body1" sx={{ py: 3 }}>
              {error}
            </Typography>
          ) : (
            <>
              {searchedUrl ? (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    Search Result
                  </Typography>
                  <UrlCard url={searchedUrl} color={theme.palette.secondary.main} />
                </Box>
              ) : (
                <Box>
                  <Typography variant="h5" component="h2" gutterBottom>
                    Top URLs
                  </Typography>

                    <span style={{ fontSize: '0.7em', paddingBottom: '8px', color: theme.palette.text.secondary }}>
                      *updated every 6 hours
                    </span>
                    
                  <Grid container spacing={2} justifyContent="center">
                    {topUrls.map((url, index) => (
                      <Grid item xs={12} sm={6} md={4} key={url.shortUrl}>
                        <UrlCard
                          url={url}
                          index={index}
                          color={theme.palette.urlCardColors[index % theme.palette.urlCardColors.length]}
                        />
                      </Grid>
                    ))}
                    {topUrls.length === 0 && (
                      <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                        No top URLs available.
                      </Typography>
                    )}
                  </Grid>
                </Box>
              )}
            </>
          )}
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default AnalyticsPage;
