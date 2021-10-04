import "./App.css";
import React from "react";
import web3 from './web3';
import lottery from './lottery';

class App extends React.Component {
  state = { 
    manager: '',
    contestants: [],
    prizeMoney: '',
    value: '',
    processingMsg: '',
  }

  async componentDidMount() {
    const manager = await lottery.methods.manager().call();
    const contestants = await lottery.methods.getContestants().call();
    const prizeMoney = await web3.eth.getBalance(lottery.options.address)

    this.setState({
      manager,
      contestants,
      prizeMoney
    })
  }

  onSubmit = async (event) => {
    event.preventDefault();
    const accounts = await web3.eth.getAccounts();

    this.setState({ processingMsg: 'Waiting for transaction success...'})
    await lottery.methods.buyTicket().send({ gas: '1000000', gasPrice: '5000000000', from: accounts[0], value: web3.utils.toWei(this.state.value, 'ether') })
    this.setState({ processingMsg: 'Transaction successful!!!'})
    setTimeout(() => this.setState({ processingMsg: ''}), 2500)
  }

  pickWinner = async () => {
    const accounts = await web3.eth.getAccounts();

    this.setState({ processingMsg: 'Waiting for transaction success...'})
    await lottery.methods.selectWinner().send({ gas: '1000000', gasPrice: '5000000000', from: accounts[0] })
    this.setState({ processingMsg: 'Winner picked!!!'})
    setTimeout(() => this.setState({ processingMsg: ''}), 2500)
  }

  render() { 
    return (
      <div>
        <h2>This is our lottery contract</h2>
        <p>This contract is managed by {this.state.manager}</p>
        <p>There are currently {this.state.contestants.length} contestants competing to win {web3.utils.fromWei(this.state.prizeMoney, 'ether')} ether!</p>
        <hr />
        <form onSubmit={this.onSubmit}>
          <h4>Want to try your luck?</h4>
          <div>
            <label>Amount of ether to enter</label>
            <input 
              onChange={event => this.setState({ value: event.target.value })}
              value={this.state.value}
            />
          </div>
          <button>Enter</button>
        </form>
        <hr />
        <h4>Time to pick a winner</h4>
        <button onClick={this.pickWinner}>Enter</button>
        <hr />
        <h1>{this.state.processingMsg}</h1>
      </div>
    );
  }
}
export default App;