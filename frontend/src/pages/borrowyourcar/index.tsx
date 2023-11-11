import {Button, Image} from 'antd';
import React from 'react';
import {useEffect, useState} from 'react';
import {borrowYourCarContract, myERC20Contract, web3} from "../../utils/contracts";
import './index.css';

const GanacheTestChainId = '0x539' // Ganache默认的ChainId = 0x539 = Hex(1337)
// TODO change according to your configuration
const GanacheTestChainName = 'Ganache Test Chain'
const GanacheTestChainRpcUrl = 'http://127.0.0.1:8545'

const LotteryPage = () => {

    const [account, setAccount] = useState('')
    const [accountBalance, setAccountBalance] = useState(0)

    const [ownercar, setownercar] = useState<string[]>([]);

    const [unborrowcar, setunborrowcar] = useState<string[]>([]);

    const [unborrowcar1, setunborrowcar1] = useState<number[]>([]);

    const [inputfindid,setinputfindid]=useState<number>(0);

    const [inputborrowid,setinputborrowid]=useState<number>(0);

    const [inputtime,setinputtime]=useState<number>(0);

    useEffect(() => {
        // 初始化检查用户是否已经连接钱包
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        const initCheckAccounts = async () => {
            // @ts-ignore
            const {ethereum} = window;
            if (Boolean(ethereum && ethereum.isMetaMask)) {
                // 尝试获取连接的用户账户
                const accounts = await web3.eth.getAccounts()
                if(accounts && accounts.length) {
                    setAccount(accounts[0])
                }
            }
        }

        initCheckAccounts()
    }, [])

    useEffect(() => {
        //监听用户账户变化，当账户变化时更新对应信息
        const getInfo = async () => {
            if (borrowYourCarContract) {
                let ownerCars = await borrowYourCarContract.methods.getownercar().call({
                    from: account
                });
                const owne = ownerCars.map(String);
                setownercar(owne);
                let unborrowcar = await borrowYourCarContract.methods.getunborrowcar().call({
                    from: account
                })
                const u = unborrowcar.map(String);
                setunborrowcar(u);
            } else {
                alert('Contract not exists.')
            }
        }

        if(account !== '') {
            getInfo()
        }
    }, [account])

    useEffect(() => {
        const getAccountInfo = async () => {
            if (myERC20Contract) {
                const ab = await myERC20Contract.methods.balanceOf(account).call()
                setAccountBalance(ab)
            } else {
                alert('Contract not exists.')
            }
        }

        if(account !== '') {
            getAccountInfo()
        }
    }, [account])
    const updatecars = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (borrowYourCarContract && myERC20Contract) {
            try {
                await borrowYourCarContract.methods.updatecar().call()
                alert('更新成功')
            } catch (error: any) {
                alert(error.message)
            }
        } else {
            alert('Contract not exists.')
        }
    }
    const onClaimTokenAirdrop = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (myERC20Contract) {
            try {
                await myERC20Contract.methods.airdrop().send({
                    from: account
                })
                alert('成功获取空投。')
            } catch (error: any) {
                alert(error.message)
            }

        } else {
            alert('Contract not exists.')
        }
    }
    const onClickConnectWallet = async () => {
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        // @ts-ignore
        const {ethereum} = window;
        if (!Boolean(ethereum && ethereum.isMetaMask)) {
            alert('MetaMask is not installed!');
            return
        }

        try {
            // 如果当前小狐狸不在本地链上，切换Metamask到本地测试链
            if (ethereum.chainId !== GanacheTestChainId) {
                const chain = {
                    chainId: GanacheTestChainId, // Chain-ID
                    chainName: GanacheTestChainName, // Chain-Name
                    rpcUrls: [GanacheTestChainRpcUrl], // RPC-URL
                };

                try {
                    // 尝试切换到本地网络
                    await ethereum.request({method: "wallet_switchEthereumChain", params: [{chainId: chain.chainId}]})
                } catch (switchError: any) {
                    // 如果本地网络没有添加到Metamask中，添加该网络
                    if (switchError.code === 4902) {
                        await ethereum.request({ method: 'wallet_addEthereumChain', params: [chain]
                        });
                    }
                }
            }

            // 小狐狸成功切换网络了，接下来让小狐狸请求用户的授权
            await ethereum.request({method: 'eth_requestAccounts'});
            // 获取小狐狸拿到的授权用户列表
            const accounts = await ethereum.request({method: 'eth_accounts'});
            // 如果用户存在，展示其account，否则显示错误信息
            setAccount(accounts[0] || 'Not able to get accounts');

        } catch (error: any) {
            alert(error.message)
        }
    }
    const newcar = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (borrowYourCarContract && myERC20Contract) {
            try {
                await borrowYourCarContract.methods.newcar().send({
                    from: account
                })
                alert('已在此账户上加入一辆新车。')
            } catch (error: any) {
                alert(error.message)
            }
        } else {
            alert('Contract not exists.')
        }
    }

    const findid = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }
        await updatecars()
        if (borrowYourCarContract && myERC20Contract) {
            try {
                const owner =  await borrowYourCarContract.methods.getowner(inputfindid).call()
                const borrower =  await borrowYourCarContract.methods.getwhoborrowcar(inputfindid).call()
                const time=await borrowYourCarContract.methods.getborrowtime(inputfindid).call()
                const nowtime=await borrowYourCarContract.methods.getnowtime().call()
                if(owner === '0x0000000000000000000000000000000000000000'){
                    alert('该车辆不存在')
                }
                else if(time === '0'){
                    alert('车辆ID' + inputfindid + '\n'+'车主ID' + owner + '\n'+'该车辆暂时无人借用')
                }
                else alert('车辆ID' + inputfindid + '\n'+'车主ID' + owner + '\n'+'现在被' + borrower+'借用'+'\n'+'借用结束时间为'+time+'\n'+'现在时间为'+nowtime)
            } catch (error: any) {
                alert(error.message)
            }
        } else {
            alert('Contract not exists.')
        }
    }

    const borrowcar = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (borrowYourCarContract && myERC20Contract) {
            try {
                const owner =  await borrowYourCarContract.methods.getowner(inputfindid).call()
                const borrower =  await borrowYourCarContract.methods.getwhoborrowcar(inputfindid).call()
                const borroweruilt=await borrowYourCarContract.methods.getborrowtime(inputfindid).call()

                if(owner === '0x0000000000000000000000000000000000000000'){

                    alert('该车辆不存在')
                }
                else if(owner===account){
                    alert('你不能借自己的车')
                }
                else if(borroweruilt === '0'){
                    await myERC20Contract.methods.approve(borrowYourCarContract.options.address,inputtime).send({
                        from: account
                    })
                    await borrowYourCarContract.methods.borrowcar(inputborrowid, inputtime).send({
                        from: account
                    })
                    alert('借用成功。')
                }
                else alert('车辆ID' + inputfindid + '\n'+'车ID' + owner + '\n'+'现在被' + borrower+'借用')
            } catch (error: any) {
                alert(error.message)
            }
        } else {
            alert('Contract not exists.')
        }
    }

    return (
        <div className='container'>
            <div className='main'>
                <h1>浙大租车系统</h1>
                <Button onClick={onClaimTokenAirdrop}>领取空投</Button>
            </div>
            <div className='account'>
                {account === '' && <Button onClick={onClickConnectWallet}>连接钱包</Button>}
                <div>当前用户：{account === '' ? '无用户连接' : account}</div>
                <div>当前用户拥有货币数量：{account === '' ? 0 : accountBalance}</div>
                <Button onClick={updatecars}>更新汽车状态</Button>
                <Button onClick={newcar}>获取车辆</Button>
            </div>
            <div>
                <div>车辆</div>
                <input type="number" value={inputfindid} onChange={e => setinputfindid(e.target.value)} />
                <Button onClick={findid}>查车</Button>
            </div>
            <div>
                <div>车辆</div>
                <input type="number" value={inputborrowid} onChange={e => setinputborrowid(e.target.value)} />
                <div></div>
                <div>借用时间</div>
                <input type="number" value={inputtime} onChange={e => setinputtime(e.target.value)} />
                <Button onClick={borrowcar}>租车</Button>
            </div>
            <div>自己拥有的车辆</div>

            <ul>
                {
                    ownercar.map(car => (
                        <li key={car}>
                            <div>车辆ID{car}</div>
                            {/*<img src={require(`../../images/${car}.jpg`)}/>*/}
                            {/*<img src={require(`../../${car}.jpg`)}/>*/}
                        </li>
                    ))
                }
            </ul>
            <div>空闲的车辆</div>
            <ul>
                {
                    unborrowcar.map((car) => (
                        <li key={car}>
                            <div>车辆ID{car}</div>
                            {/*<img src={require(`../../images/${car}.jpg`)}/>*/}
                            <img src={require(`../../${car}.jpg`)}/>
                        </li>
                    ))
                }
            </ul>
        </div>

    )
}



export default LotteryPage