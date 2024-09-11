const handleRegister = (req, res, db, bcrypt) => {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {     // if any of these are empty
        return res.status(400).json('incorrect form submission');
    }
    const hash = bcrypt.hashSync(password);
        db.transaction(trx => {     // Create transaction when you have to do more than 2 things at once
            trx.insert({    // Use trx to do operations instead of db now
                hash: hash,
                email: email
            })
            .into('login')
            .returning('email')
            .then(loginEmail => {
                return trx('users')
                    .returning('*')
                    .insert({
                        email: loginEmail[0].email,
                        name: name,
                        joined: new Date()
                    })
                    .then(user => {
                        res.json(user[0]);
                    })
            })
            .then(trx.commit)   // Must commit in order to add info
            .catch(trx.rollback)    // In case anything fails, we rollback changes
        })
        .catch(err => res.status(400).json('unable to register'))
}

module.exports = {
    handleRegister: handleRegister
};