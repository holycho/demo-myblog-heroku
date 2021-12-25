var express = require('express');
var db = require('../db');
var router = express.Router();

router.get('/', function (req, res, next) {
    res.render('index', { title: `My Blog` });
});

router.get('/api/blogs/:user_id', async (req, res, next) => {
    var sql = `SELECT * FROM blog WHERE user_id = '${req.params.user_id}'`;
    try {
        const client = await db.connect();
        const result = await client.query(sql);
        res.json({
            "message": "success",
            "data": result.rows
        });
        client.release();
    } catch (err) {
        console.error(err);
        res.status(500).json({
            "error": err.message
        });
    }
});

router.get('/api/blog/:id', async (req, res, next) => {
    var sql = `SELECT * FROM blog WHERE id = '${req.params.id}'`;
    try {
        const client = await db.connect();
        const result = await client.query(sql);
        if (!result.rows) {
            res.status(400).json({
                "errer": `Blog id: ${req.params.id} does not exist`
            });
            return;
        }

        res.json({
            "message": "success",
            "data": result.rows
        });
        client.release();
    } catch (err) {
        console.error(err);
        res.status(500).json({
            "error": err.message
        });
    }
});

router.post('/api/blog', async (req, res, next) => {
    let errors = [];
    // get fields from body
    if (!req.body.title) {
        errors.push('No title specified');
    }
    if (!req.body.content) {
        errors.push('No content specified');
    }
    if (!req.body.user_id) {
        errors.push('No user specified');
    }
    if (errors.length > 0) {
        res.status(400).json({
            "error": errors.join(",")
        });
        return;
    }
    var sql = `INSERT INTO blog (title,content,created,updated,user_id) VALUES ('${req.body.title}','${req.body.content}',now(),now(),'${req.body.user_id}') RETURNING id`;
    try {
        const client = await db.connect();
        const result = await client.query(sql);

        if (result.rows && result.rows.length > 0) {
            let blogId = result.rows[0].id;
            let qrySql = `SELECT * FROM blog WHERE id = '${blogId}'`;

            const qryResult = await db.query(qrySql);
            res.json({
                "message": "success",
                "data": qryResult.rows[0],
                "id": blogId
            });
        }
        client.release();
    } catch (err) {
        console.error(err);
        res.status(500).json({
            "error": err.message
        });
    }
});

router.patch('/api/blog/:id', async (req, res, next) => {
    var sql = `UPDATE blog SET title=COALESCE('${req.body.title}',title),content=COALESCE('${req.body.content}',content),updated=now() WHERE id='${req.params.id}'`;
    try {
        const client = await db.connect();
        const result = await client.query(sql);

        let qrySql = `SELECT * FROM blog WHERE id = '${req.params.id}'`;

        const qryResult = await db.query(qrySql);
        res.json({
            "message": "success",
            "data": qryResult.rows[0],
            "id": req.params.id
        });
        client.release();
    } catch (err) {
        console.error(err);
        res.status(500).json({
            "error": err.message
        });
    }
});

router.delete('/api/blog/:id', async (req, res, next) => {
    var countSql = `SELECT COUNT(*) FROM blog WHERE id = '${req.params.id}'`;
    try {
        const client = await db.connect();
        const countResult = await client.query(countSql);

        if (countResult.rows && countResult.rows.length > 0) {
            let count = +countResult.rows[0].count;

            if (count === 0) {
                res.status(400).json({
                    "errer": `Blog id: ${req.params.id} does not exist`
                });
                return;
            }

            var sql = `DELETE FROM blog WHERE id = '${req.params.id}'`;
            const result = await client.query(sql);
            res.json({
                "message": "success",
                "changes": `blog id: ${req.params.id} is deleted`,
                "id": req.params.id
            });
        }
        client.release();
    } catch (err) {
        console.error(err);
        res.status(500).json({
            "error": err.message
        });
    }

    var sql = `DELETE FROM blog WHERE id = '${req.params.id}'`;
    try {
        const client = await db.connect();
        const result = await client.query(sql);
        res.json({
            "message": "success",
            "changes": `blog id: ${req.params.id} is deleted`,
            "id": req.params.id
        });
        client.release();
    } catch (err) {
        console.error(err);
        res.status(500).json({
            "error": err.message
        });
    }
})

router.get('/api/account', async (req, res, next) => {
    var sql = `SELECT * FROM account`;
    try {
        const client = await db.connect();
        const result = await client.query(sql);
        res.json({
            "message": "success",
            "data": result.rows
        });
        client.release();
    } catch (err) {
        console.error(err);
        res.status(500).json({
            "error": err.message
        });
    }
});

router.post('/api/account', async (req, res, next) => {
    let errors = [];
    // get fields from body
    if (!req.body.username) {
        errors.push('No username specified');
    }
    if (!req.body.password) {
        errors.push('No password specified');
    }
    if (errors.length > 0) {
        res.status(400).json({
            error: errors.join(", "),
            errcode: "BAD_REQUEST"
        })
        return;
    }
    if (req.body.username === "admin") {
        res.status(400).json({
            error: `Account: \'admin\' is the default one`,
            errcode: "DEFAULT_ACCOUNT"
        })
        return;
    }

    var countSql = `SELECT COUNT(*) FROM account WHERE username='${req.body.username}'`;
    try {
        const client = await db.connect();
        const countResult = await client.query(countSql);

        if (countResult.rows && countResult.rows.length > 0) {
            let count = +countResult.rows[0].count;
            if (count > 0) {
                res.status(400).json({
                    error: `account: \'${req.body.username}\' already exists`,
                    errcode: "DUPLICATE_ACCOUNT"
                });
                return;
            }

            var sql = `INSERT INTO account (username,password,created_time,updated_time) VALUES ('${req.body.username}','${req.body.password}',now(),now()) RETURNING acc_id`;
            
            const result = await client.query(sql);
            if (result.rows && result.rows.length > 0) {
                let accId = result.rows[0].acc_id;
                var qrySql = `SELECT * FROM account WHERE acc_id = ${accId}`;

                let qryResult = await client.query(qrySql);
                res.json({
                    "message": "success",
                    "data": {
                        username: qryResult.rows[0].username,
                        updated: qryResult.rows[0].updated_time,
                        created: qryResult.rows[0].created_time
                    },
                    "acc_id": accId
                });
            }
        }
        client.release();
    } catch (err) {
        console.error(err);
        res.status(500).json({
            "error": err.message
        });
    }
});

router.delete('/api/account/:id', async (req, res, next) => {
    var sql = `DELETE FROM account WHERE acc_id = '${req.params.id}'`;
    try {
        const client = await db.connect();
        const result = await client.query(sql);
        res.json({
            "message": "success",
            "changes": `account id: ${req.params.id} is deleted`,
            "id": req.params.id
        });
        client.release();
    } catch (err) {
        console.error(err);
        res.status(500).json({
            "error": err.message
        });
    }
})

module.exports = router
