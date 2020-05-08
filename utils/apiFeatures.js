class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }
    filterKeyword() {
        let queryObj = {...this.queryString };
        const excludedField = [
            'page',
            'sort',
            'limit',
            'fields',
        ];
        excludedField.forEach(el => delete queryObj[el]);
        queryObj = JSON.parse(
            JSON.stringify(queryObj).replace(
                /\b(gte|gt|lt|lte)\b/g,
                match => `$${match}`
            )
        );
        this.query.find(queryObj);
        return this;
    }
    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort
                .split(',')
                .join(' ');
            this.query.sort(sortBy);
        } else {
            this.query.sort('-createdAT');
        }
        return this;
    }
    selectFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields
                .split(',')
                .join(' ');
            this.query.select(fields);
        } else {
            this.query.select('-__v');
        }
        return this;
    }
    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;
        this.query.skip(skip).limit(limit);
        return this;
    }
}
module.exports = APIFeatures;