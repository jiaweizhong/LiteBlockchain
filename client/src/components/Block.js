import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import Transaction from './Transaction';

class Block extends Component{
    state = {displayTransaction: false};

    toggleTransaction = () => {
        this.setState({displayTransaction: !this.state.displayTransaction});
    }

    // react get property
    get displayTransaction() {
        // data passed from parent
        const { data } = this.props.block;
        const stringfiedData = JSON.stringify(data);

        const dataDisplay = stringfiedData.length > 35 ? 
            `${stringfiedData.substring(0, 35)}...`:
            stringfiedData;

        if(this.state.displayTransaction){
            return (
                <div>
                    {
                        data.map(transaction => (
                            <div key={transaction.id}>
                                <hr />
                                <Transaction transaction={transaction} />
                            </div>
                        ))
                    }
                    <br />
                    <Button bsStyle="danger"
                            bsSize="small"
                            onClick={this.toggleTransaction}>
                            Show less
                    </Button>
                </div>
            );
        }
        
        return (
            <div>
                <div>Data: {dataDisplay}</div>
                <Button bsStyle="danger"
                        bsSize="small"
                        onClick={this.toggleTransaction}>
                        Show more
                </Button>
            </div>
        );
    }

    render() {
        console.log('this.displayTransaction', this.displayTransaction);

        // data passed from parent
        const { timestamp, hash } = this.props.block;
        // short display for hash
        const hashDisplay = `${hash.substring(0, 15)}...`;
        
        return (
            <div className='Block'>
                <div>Hash: {hashDisplay}</div>
                <div>Timestamp: {new Date(timestamp).toLocaleString()}</div>
                {this.displayTransaction}
            </div>
        );
    }
};

export default Block;