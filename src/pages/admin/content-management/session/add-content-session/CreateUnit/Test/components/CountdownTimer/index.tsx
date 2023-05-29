import moment from 'moment';
import React, { useEffect, useState } from 'react';

const SECOND = 1;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

interface IProps {
    isStart: boolean;
    isFinished: boolean;
    endTime: any;
    handleTimeOut: () => void;
}

const CountdownTimer = (props: IProps) => {

    const {
        isStart,
        isFinished,
        endTime,
        handleTimeOut,
    } = props

    const [remainingTime, setRemainingTime] = useState<number>(moment.duration(moment(endTime).diff(moment())).asSeconds());

    useEffect(() => {
        const interval = setInterval(
            () => {
                if (isStart && !isFinished && remainingTime && remainingTime > 0 && endTime) {
                    const duration = moment.duration(moment(endTime).diff(moment()));
                    setRemainingTime(duration.asSeconds());
                }
                else if (isStart && !isFinished && endTime && (remainingTime <= 0)) {
                    clearInterval(interval);
                    handleTimeOut();
                }
                else {
                    clearInterval(interval);
                }
            },
            1000,
        );
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        }
    }, [endTime, remainingTime]);

    return (
        <div className="flex">
            {remainingTime && (
                <div className='flex items-center gap-3 flex-auto'>
                    {Object.entries({
                        h: (remainingTime / HOUR) % 24,
                        m: (remainingTime / MINUTE) % 60,
                        s: (remainingTime / SECOND) % 60,
                    }).map(([label, value]) => (Math.floor(value > 0 ? value : 0) > 0 || label === 's') && (
                        <div className="box text-xl" key={label}>
                            <span>{`${Math.floor(value > 0 ? value : 0)}`.padStart(1, "0")}</span>
                            <span className="text">{label}</span>
                        </div>
                    ))}
                    <span className="text-xl">remaining</span>
                </div>
            )}
        </div>
    );
}

export default CountdownTimer;