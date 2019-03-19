import React, { Component } from 'react';
import { FormGroup, FormControl, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import history from '../history';

class ConductTransaction extends Component{
    state = { recipient:'', amount: 0, knowAddresses: [] };
    
    // fetch know addresses
    componentDidMount() {
        fetch(`${document.location.origin}/api/known-address`)
            .then(response => response.json())
            .then(json => this.setState({knowAddresses: json}));
    }

    updateRecipient = event => {
        this.setState({ recipient: event.target.value});
    }

    updateAmount = event => {
        this.setState({ amount: Number(event.target.value)});
    }

    conductTransaction = () => {
        const { recipient, amount } = this.state;

        fetch(`${document.location.origin}/api/transact`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ recipient, amount })
        }).then( response => response.json())
          .then( json => {
             alert(json.message || json.type); 
             history.push('/transaction-pool');
          });
    }

    render() {
        return(
            <div className='ConductTransaction'>
                <Link to='/'>Home</Link>
                <h3>Conduct a Transaction</h3>
                <br />
                <h4>Known Addresses</h4>
                {
                    this.state.knowAddresses.map(knowAddresses => {
                        return(
                            <div key={knowAddresses}>
                                <div>{knowAddresses}</div>
                                <br />
                            </div>
                        );
                    })
                }
                <br />
                <FormGroup>
                    <FormControl input='text'
                                 placeholder='recipient'
                                 value={this.state.recipient}
                                 onChange={this.updateRecipient}>
                    </FormControl>
                </FormGroup>
                <FormGroup>
                    <FormControl input='number'
                                 placeholder='amount'
                                 value={this.state.amount}
                                 onChange={this.updateAmount}>
                    </FormControl>
                </FormGroup>
                <div>
                    <Button bsStyle='danger'
                            onClick={this.conductTransaction}>
                    Submit
                    </Button>
                </div>
            </div>
        )
    }
};

export default ConductTransaction;