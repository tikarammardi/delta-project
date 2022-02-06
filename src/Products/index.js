import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Button, ListGroup, Card, Table, Spinner } from 'react-bootstrap';
import { baseUrl, wsUrl } from '../config/baseUrl';

const ws = new WebSocket(wsUrl);
const DataList = (props) => {
	const { loading, error, data } = props;

	const listItems = data.map((item, i) => {
		//console.log('each items', item);
		return (
			<tbody key={item.id} style={{ color: 'white' }}>
				<tr>
					<td>{i}</td>
					<td>{item.symbol}</td>
					<td>{item.description}</td>
					<td>{item.underlying_asset.symbol}</td>
					<td>{item.underlying_asset.mark_price}</td>
				</tr>
			</tbody>
		);
	});

	if (error) return <div>Something went wrong</div>;

	return !loading ? (
		<Table striped hover variant="dark">
			<thead
				style={{
					position: 'sticky',
					top: 0
				}}
			>
				<tr>
					<th className="header">#</th>
					<th className="header">Symbol</th>
					<th className="header">Description</th>
					<th className="header">Underlying Assets</th>
					<th className="header">Mark Price</th>
				</tr>
			</thead>
			{listItems}
		</Table>
	) : (
		<div>
			<p>Loading .......</p>
			<Spinner animation="grow" className="text-center" />
		</div>
	);
};

export default function Product() {
	const [ products, setProducts ] = useState([]);
	const [ loading, setLoading ] = useState(true);
	const [ error, setError ] = useState(false);
	const [ underLyingAsset, setUnderLyingAsset ] = useState([]);
	const [ symbols, setSymbols ] = useState(null);

	const apiCall = {
		type: 'subscribe',
		payload: {
			channels: [ { name: 'v2/ticker', symbols: symbols } ]
		}
	};

	const fetchProducts = async () => {
		try {
			const response = await axios.get(`${baseUrl}/v2/products`);
			console.log('response is', response);
			const data = response.data.result;
			setProducts(data);
			const filterSymbols = data.map((item) => item.underlying_asset.symbol);
			console.log('symbols', filterSymbols);
			setSymbols(filterSymbols);
			setLoading(false);
		} catch (error) {
			setError(true);
			console.log('error in fetching data', error);
		}
	};

	useEffect(() => {
		fetchProducts();
	}, []);

	useEffect(() => {
		ws.onopen = (event) => {
			console.log('event on open', event);
			ws.send(JSON.stringify(apiCall));
		};
		ws.onmessage = function(event) {
			console.log('evnet is on message ', event);
			const json = JSON.parse(event.data);
			try {
				console.log('json data', json);
			} catch (err) {
				console.log('err', err);
			}
		};

		// websocket onerror event listener
		ws.onerror = (err) => {
			console.error('Socket encountered error: ', err.message, 'Closing socket');

			ws.close();
		};
		//clean up function
		return () => ws.close();
	}, []);

	return (
		<React.Fragment>
			<DataList data={products} loading={loading} error={error} underLyingAsset={underLyingAsset} />
		</React.Fragment>
	);
}
