import SearchOffIcon from '@mui/icons-material/SearchOff';
import { Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { EmptyState } from '../components/common/StateViews';

export default function NotFoundPage() {
  return (
    <EmptyState
      icon={<SearchOffIcon />}
      title="Page not found"
      message="The page you are looking for does not exist."
      action={
        <Button component={RouterLink} to="/" variant="contained">
          Go to Dashboard
        </Button>
      }
    />
  );
}
