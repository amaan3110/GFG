const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

app.set('view engine', 'ejs');


async function connectDB() {
    try {
        await mongoose.connect('mongodb+srv://sheikhofficial48:amaan%403121@cluster0.wfp0b5x.mongodb.net/acxiom?retryWrites=true&w=majority&appName=Cluster0');
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}
connectDB();

const transactionSchema = new mongoose.Schema({
    id: Number,
    title: String,
    price: Number,
    description: String,
    category: String,
    image: String,
    sold: Boolean,
    dateOfSale: Date,
});

const Transaction = mongoose.model('Transaction', transactionSchema);

const priceRanges = [
    { range: '0-100', min: 0, max: 100 },
    { range: '101-200', min: 101, max: 200 },
    { range: '201-300', min: 201, max: 300 },
    { range: '301-400', min: 301, max: 400 },
    { range: '401-500', min: 401, max: 500 },
    { range: '501-600', min: 501, max: 600 },
    { range: '601-700', min: 601, max: 700 },
    { range: '701-800', min: 701, max: 800 },
    { range: '801-900', min: 801, max: 900 },
    { range: '901-above', min: 901, max: Infinity }
];


app.get('/initialize', async (req, res) => {
    try {
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        const transactions = response.data;

        await Transaction.deleteMany({});

        await Transaction.insertMany(transactions);

        res.send('Database initialized with seed data.');
    } catch (error) {
        res.status(500).send('Error initializing database.');
    }
});

app.get('/transactions', async (req, res) => {
    const { month, search, page = 1, perPage = 10 } = req.query;
    const query = {};

    if (month) {
        const monthIndex = new Date(Date.parse(month + " 1, 2023")).getMonth();
        query.dateOfSale = { $month: monthIndex + 1 };
    }

    if (search) {
        query.$or = [
            { title: new RegExp(search, 'i') },
            { description: new RegExp(search, 'i') },
            { price: parseFloat(search) },
        ];
    }

    try {
        const transactions = await Transaction.find(query)
            .skip((page - 1) * perPage)
            .limit(parseInt(perPage));
        const total = await Transaction.countDocuments(query);

        res.json({
            transactions,
            total,
            page: parseInt(page),
            perPage: parseInt(perPage),
            totalPages: Math.ceil(total / perPage),
        });
    } catch (error) {
        res.status(500).send('Error fetching transactions.');
    }
});


app.get('/', async (req, res) => {
    const { month, search, page = 1, perPage = 10 } = req.query;
    const query = {};

    if (month) {
        const monthIndex = new Date(Date.parse(month + " 1, 2023")).getMonth();
        query.dateOfSale = { $month: monthIndex + 1 };
    }

    if (search) {
        query.$or = [
            { title: new RegExp(search, 'i') },
            { description: new RegExp(search, 'i') },
            { price: parseFloat(search) },
        ];
    }

    try {
        const transactions = await Transaction.find(query)
            .skip((page - 1) * perPage)
            .limit(parseInt(perPage));
        const total = await Transaction.countDocuments(query);

        res.render('index', {
            transactions,
            total,
            page: parseInt(page),
            perPage: parseInt(perPage),
            totalPages: Math.ceil(total / perPage),
            query: req.query
        });
    } catch (error) {
        res.status(500).send('Error fetching transactions.');
    }
});

app.get('/statistics', async (req, res) => {
    const { month } = req.query;
    if (!month) {
        return res.status(400).send('Month is required.');
    }

    try {
        const monthIndex = new Date(Date.parse(month + " 1, 2023")).getMonth() + 1;

        const query = {
            $expr: {
                $eq: [{ $month: "$dateOfSale" }, monthIndex]
            }
        };

        const totalSaleAmount = await Transaction.aggregate([
            { $match: query },
            { $group: { _id: null, totalAmount: { $sum: "$price" } } }
        ]);

        const totalSoldItems = await Transaction.countDocuments(query);

        const totalNotSoldItems = await Transaction.countDocuments({
            ...query,
            price: { $eq: 0 }
        });

        res.render('search', {
            month,
            totalSaleAmount: totalSaleAmount[0] ? totalSaleAmount[0].totalAmount : 0,
            totalSoldItems,
            totalNotSoldItems
        });
    } catch (error) {
        res.status(500).send('Error fetching statistics.');
    }
});

app.get('/barchart', async (req, res) => {
    const { month } = req.query;
    if (!month) {
        return res.status(400).send('Month is required.');
    }

    try {
        const monthIndex = new Date(Date.parse(month + " 1, 2023")).getMonth() + 1;

        const query = {
            $expr: {
                $eq: [{ $month: "$dateOfSale" }, monthIndex]
            }
        };

        const transactions = await Transaction.find(query);

        const priceRangeCounts = priceRanges.map(range => {
            const count = transactions.filter(transaction => transaction.price >= range.min && transaction.price <= range.max).length;
            return { range: range.range, count };
        });

        //res.json(priceRangeCounts);
        res.json({
            month,
            priceRangeCounts
        });
    } catch (error) {
        res.status(500).send('Error fetching bar chart data.');
    }
});

app.get('/piechart', async (req, res) => {
    const { month } = req.query;
    if (!month) {
        return res.status(400).send('Month is required.');
    }

    try {
        const monthIndex = new Date(Date.parse(month + " 1, 2023")).getMonth() + 1;

        const query = {
            $expr: {
                $eq: [{ $month: "$dateOfSale" }, monthIndex]
            }
        };

        const transactions = await Transaction.find(query);

        const categoryCounts = transactions.reduce((acc, transaction) => {
            if (!acc[transaction.category]) {
                acc[transaction.category] = 0;
            }
            acc[transaction.category]++;
            return acc;
        }, {});

        const categories = Object.keys(categoryCounts).map(category => ({
            category,
            count: categoryCounts[category]
        }));

        res.json({
            month,
            categories
        });
    } catch (error) {
        res.status(500).send('Error fetching pie chart data.');
    }
});


app.get('/combined-data', async (req, res) => {
    const { month } = req.query;
    if (!month) {
        return res.status(400).send('Month is required.');
    }

    try {
        const [statisticsResponse, barchartResponse, piechartResponse] = await Promise.all([
            axios.get(`http://localhost:3000/statistics?month=${month}`),
            axios.get(`http://localhost:3000/barchart?month=${month}`),
            axios.get(`http://localhost:3000/piechart?month=${month}`)
        ]);

        const combinedData = {
            statistics: statisticsResponse.data,
            barchart: barchartResponse.data,
            piechart: piechartResponse.data
        };

        res.json(combinedData);
    } catch (error) {
        res.status(500).send('Error fetching combined data.');
    }
});



app.get('/bar-chart', (req, res) => {
    res.render('bar-chart');
})

app.get('/pie-chart', (req, res) => {
    res.render('pie-chart');
})


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});