import React, { FC, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { createUseStyles } from 'react-jss';
import pTimeout from 'p-timeout';

import { install, installError } from '../../state/features/miner'
import { RootState } from '../../state/store';
import { apiResponseTimeoutMilliseconds } from '../../constants';

const useStyles = createUseStyles({
    container: {
        display: 'flex',
        flexDirection: 'column'
    }
})

const InstallButton: FC = () => {
    const styles = useStyles()
    const containerState = useSelector((state: RootState) => state.miner.container)
    const dispatch = useDispatch()

    const [wallet, setWallet] = useState('')

    const onInstallClick = useCallback(() => {
            const apiRequest = pTimeout(window.minerService.install(wallet), {
                milliseconds: apiResponseTimeoutMilliseconds
            })

            apiRequest.then(containerId => {
                if (containerId) {
                    dispatch(install(containerId))
                }
            }).catch(error => {
                dispatch(installError(String(error)))
            })
    }, [wallet, dispatch])

    const shouldDisplayComponent = containerState === null

    if (shouldDisplayComponent) {
        return (
            <div className={styles.container}>
                <TextField 
                    id="wallet" 
                    label="Wallet" 
                    variant="outlined" 
                    value={wallet} 
                    onChange={(e) => setWallet(e.target.value)}
                />
                <Button onClick={onInstallClick}>Install miner</Button>
            </div>
        )
    }

    return (<></>)
}

export default InstallButton
