import {Button, Image} from 'antd';
import {UserOutlined} from "@ant-design/icons";
import React from 'react';
import {useEffect, useState} from 'react';
import {borrowYourCarContract, myERC20Contract, web3} from "../../utils/contracts";
import './index.css';
import ImageComponent from "../../images/ImageCompoent";

const GanacheTestChainId = '0x539' // Ganache默认的ChainId = 0x539 = Hex(1337)
// TODO change according to your configuration
const GanacheTestChainName = 'Ganache Test Chain'
const GanacheTestChainRpcUrl = 'http://127.0.0.1:8545'

const LotteryPage = () => {

    const [account, setAccount] = useState('')
    const [accountBalance, setAccountBalance] = useState(0)

    const [ownercar, setownercar] = useState<Car[]>([]);

    const [unborrowcar, setunborrowcar] = useState<Car[]>([]);

    const [inputfindid,setinputfindid]=useState<number>(0);

    const [inputborrowid,setinputborrowid]=useState<number>(0);

    const [inputtime,setinputtime]=useState<number>(0);

    class Car {
        tokenId: number;
        constructor(tokenId: number) {
            this.tokenId = tokenId
        }
    }


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
                })
                const updatedMyCars = ownerCars.map((carId: number) => new Car(carId));
                setownercar(updatedMyCars);
                let unborrowcar = await borrowYourCarContract.methods.getunborrowcar().call({
                    from: account
                })
                const u = unborrowcar.map((carId: number) => new Car(carId));
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

    const onClaimTokenAirdrop = async () => {
        if(account === '') {
            alert('')
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
            alert('合约不存在')
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
            alert('未连接到钱包。')
            return
        }

        if (borrowYourCarContract && myERC20Contract) {
            try {
                // 获取一辆新车
                await borrowYourCarContract.methods.newcar().send({
                    from: account
                })
                alert('已加入新车。')
            } catch (error: any) {
                alert(error.message)
            }
        } else {
            alert('合约不存在')
        }
    }

    const findid = async () => {
        if(account === '') {
            alert('未连接到钱包。')
            return
        }

        if (borrowYourCarContract && myERC20Contract) {
            try {
                // 获取一辆新车
                const owner =  await borrowYourCarContract.methods.getowner(inputfindid).call()
                const borrower =  await borrowYourCarContract.methods.getwhoborrowcar(inputfindid).call()
                if(owner === '0x0000000000000000000000000000000000000000'){

                    alert('该车辆不存在,请检查输入的车辆ID是否正确')
                }
                else if(borrower === '0x0000000000000000000000000000000000000000'){
                    alert('车辆ID：' + inputfindid + '\n车主是：' + owner + '\n该车辆当前空闲')
                }
                else alert('车辆ID：' + inputfindid + '\n车主是：' + owner + '\n借用者是：' + borrower)
            } catch (error: any) {
                alert(error.message)
            }
        } else {
            alert('合约不存在')
        }
    }

    const borrowcar = async () => {
        if(account === '') {
            alert('未连接到钱包。')
            return
        }

        if (borrowYourCarContract && myERC20Contract) {
            try {
                // 获取一辆新车
                const owner =  await borrowYourCarContract.methods.getowner(inputfindid).call()
                const borrower =  await borrowYourCarContract.methods.getwhoborrowcar(inputfindid).call()

                if(owner === '0x0000000000000000000000000000000000000000'){

                    alert('该车辆不存在,请检查输入的车辆ID是否正确')
                }
                else if(owner===account){
                    alert('你不能借自己的车')
                }
                else if(borrower === '0x0000000000000000000000000000000000000000'){
                    await myERC20Contract.methods.approve(borrowYourCarContract.options.address,inputtime).send({
                        from: account
                    })
                    //借用车辆
                    await borrowYourCarContract.methods.borrowcar(inputborrowid, inputtime).send({
                        from: account
                    })
                    alert('借用成功。')
                }
                else alert('车辆ID：' + inputfindid + '\n车主是：' + owner + '\n借用者是：' + borrower)
            } catch (error: any) {
                alert(error.message)
            }
        } else {
            alert('合约不存在')
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
                <div>当前用户拥有浙大币数量：{account === '' ? 0 : accountBalance}</div>
                <Button onClick={newcar}>获取车辆</Button>
                <div>
                    <span>车辆ID：</span>
                    <input type="number"style={{marginRight: '20px'}} value={inputfindid} onChange={e => setinputfindid(e.target.value)} />
                    <Button style={{width: '200px'}} onClick={findid}>查询车辆</Button>
                    <div>{inputfindid}</div>
                </div>
                <div>
                    <span>车辆ID：</span>
                    <input type="number"style={{marginRight: '20px'}} value={inputborrowid} onChange={e => setinputborrowid(e.target.value)} />
                    <input type="number"style={{marginRight: '20px'}} value={inputtime} onChange={e => setinputtime(e.target.value)} />
                    <Button style={{width: '200px'}} onClick={borrowcar}>租借车辆</Button>
                    <div>{inputfindid}</div>
                </div>
                <div>我的车辆</div>
                <ul>
                    {
                        ownercar.map(car => (
                            <li key={car.tokenId}>
                                <span>车辆ID:{car.tokenId}</span>
                                <ImageComponent tokenId={car.tokenId} />
                            </li>
                        ))
                    }
                </ul>
                <div>空闲的车辆</div>
                <ul>
                    {unborrowcar.map((car) => (
                        <li key={car.tokenId}>
                            <span>车辆ID：{car.tokenId}</span>
                            <br></br>
                            <ImageComponent tokenId={car.tokenId} />
                        </li>
                    ))}
                </ul>
`
            </div>
        </div>

    )
}

export default LotteryPage