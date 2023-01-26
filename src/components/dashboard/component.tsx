import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import { useSelector } from 'react-redux'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { RootState } from '../../state/store';

const useStyles = createUseStyles({
    container: {
        display: 'flex',
        flexDirection: 'column',
        width: '80%'
    }
})

const AppsDashboard: FC = () => {
    const minerState = useSelector((state: RootState) => state.miner.container)

    const styles = useStyles()
    return (
        <div className={styles.container}>
            { minerState && minerState.status !== 'fetchError' && 
                <Card>
                    <CardContent>
                        <Typography>XMRIG</Typography>
                        <Typography>ContainerID: {minerState.id}</Typography>
                        <Typography>Container status: {minerState.status}</Typography>
                    </CardContent>
                </Card>
            }
            { minerState && minerState.status === 'fetchError' &&
                <Card>
                    <CardContent>
                        <Typography>Miner backend connectivity error</Typography>
                        <Typography>Error message: {minerState.errorMessage}</Typography>
                    </CardContent>
                </Card>
            }
        </div>
    )
}

export default AppsDashboard
