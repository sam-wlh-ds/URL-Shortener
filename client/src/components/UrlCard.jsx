import {
  Box,
  Typography,
  Paper,
} from "@mui/material";
import LinkIcon from '@mui/icons-material/Link'; // For long URL
import ShortTextIcon from '@mui/icons-material/ShortText'; // For short URL
import VisibilityIcon from '@mui/icons-material/Visibility'; // For used count
import { backend } from "../global/variables";

const UrlCard = ({ url, index, color }) => (
  <Paper
    sx={{
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1,
      backgroundColor: color,
      color: 'white', // Text color for contrast
      textAlign: 'center',
      minHeight: 150, // Ensure cards have a minimum height
      borderRadius: '12px', // Rounded corners for a softer look
      boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)', // Subtle shadow
      transition: 'transform 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-5px)',
      },
    }}
  >
    {index !== undefined && ( // Only show rank for top URLs
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold' }}>
        #{index + 1}
      </Typography>
    )}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <LinkIcon fontSize="small" />
      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
        {url.longUrl.length > 30 ? url.longUrl.substring(0, 27) + '...' : url.longUrl}
      </Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <ShortTextIcon fontSize="small" />
      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
        {backend}/{url.shortUrl}
      </Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <VisibilityIcon fontSize="small" />
      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
        Used: {url.usedCount}
      </Typography>
    </Box>
  </Paper>
);

export default UrlCard;