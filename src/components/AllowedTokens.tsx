import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { RelayingServices } from "relaying-services-sdk";
import { Select } from 'react-materialize';

type AllowedTokensProps = {
    provider: RelayingServices;
    setUpdateInfo: Dispatch<SetStateAction<boolean>>;
    token: string;
    setToken: Dispatch<SetStateAction<string>>
};

function AllowedTokens(props: AllowedTokensProps) {

    const { provider, setUpdateInfo, token, setToken } = props;

    const [allowedTokens, setAllowedTokens] = useState<Array<string>>([]);

    const reload = async () => {
        const tokens = await provider.getAllowedTokens();
        setAllowedTokens(tokens);
        console.log('x aca vamos')
        console.log(token);
        if(!token){
            setToken(tokens[0]);
        }   
    }

    useEffect(() => {
        console.log(' que tal xafa')
        reload();
    }, [])

    const handleChange = (event: any) => {
        setToken(event.target.value);
        setUpdateInfo(true);
    }

    return (
        <Select
            onChange={handleChange}
        >
            {
                allowedTokens.map(value =>
                (
                    <option
                        value={token}
                        key={value}
                    >
                        {value}
                    </option>
                )
                )
            }
        </Select>
    );

}

export default AllowedTokens;