import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

interface AlertDialogProps {
  open: boolean;
  close: () => void;
}

export const AlertDialog = ({ open, close }: AlertDialogProps) => {
  return (
    <Dialog open={open} onClose={close} aria-describedby='alert-dialog-slide-description'>
      <DialogContent>
        <DialogContentText id='alert-dialog-slide-description'>This game requires to bet 200 tokens.</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Decline</Button>
        <Button onClick={close}>Accept</Button>
      </DialogActions>
    </Dialog>
  );
};
