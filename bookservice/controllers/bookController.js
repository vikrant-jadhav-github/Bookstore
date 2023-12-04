const { book, seller } = require("../models/book");
const { uploadFile } = require("../utils/uploadFile");
const { Op } = require("sequelize");

exports.getBookById = async (req, res) => {
    try{

        const { id } = req.params;

        if (!id) {
            return res.status(400).send({
                status : false,
                message : "id is required",
                data : null
            })
        }

        try{
            
            const bookData = await book.findOne(
                {
                include : {
                        model : seller,
                        as : "seller",
                },
                where : {
                    id,
                }
            });

            if (!bookData) {
                return res.status(404).send({
                    status : false,
                    message : "book not found with that particular id",
                    data : null
                })
            }

            res.status(200).json({
                status : true,
                message : "book data fetched successfully",
                data : bookData
            });

        }
        catch(e){
            res.status(400).send({
                status : false,
                message : e.message,
                custommessage : "error while fetching the books",
                data : null,
            })
        }

    }   
    catch(e){
        res.status(500).send({
            status : false,
            message : e.message,
            custommessage : "server error, try again later!",
            data : null,
        })
    }
}

exports.getSellerBooks = async (req, res) => {
    try{

        const sellerid = req.params.sellerid

        if (!sellerid) {
            return res.status(400).send({
                status : false,
                message : "seller is required",
                data : null
            })
        }

        try{
            
            const bookData = await book.findAll({
                include : {
                    model : seller,
                    as : "seller",
                },
                where : {
                    seller_id : sellerid
                }
            });

            if (!bookData) {
                return res.status(404).send({
                    status : false,
                    message : "book not found with that particular id",
                    data : null
                })
            }

            res.status(200).json({
                status : true,
                message : "book data fetched successfully",
                data : bookData
            })

        }
        catch(e){
            res.status(400).send({
                status : false,
                message : e.message,
                custommessage : "error while fetching the books",
                data : null,
            })
        }

    }
    catch(e){
        res.status(500).send({
            status : false,
            message : e.message,
            custommessage : "server error, try again later!",
            data : null,
        })
    }
}

exports.getBooksByQuery = async (req, res) => {
    try {
        const { author, genre, title } = req.query;

        if (!author && !genre && !title) {
            return res.status(400).send({
                status: false,
                message: "Give at least one query",
                data: null
            });
        }

        try {
            const whereClause = {};

            if (author) {
                whereClause.author = {
                    [Op.like]: `%${author}%`
                };
            }

            if (genre) {
                whereClause.genre = {
                    [Op.like]: `%${genre}%`
                };
            }

            if (title) {
                whereClause.title = {
                    [Op.like]: `%${title}%`
                };
            }

            const bookData = await book.findAll({
                where: whereClause,
                include: [
                    {
                        model: seller,
                        as: "seller"
                    }
                ]
            });

            if (!bookData || bookData.length === 0) {
                return res.status(404).send({
                    status: false,
                    message: "Book not found with that particular query",
                    data: null
                });
            }

            res.status(200).json({
                status: true,
                message: "Book data fetched successfully",
                data: bookData
            });
        } catch (e) {
            res.status(400).send({
                status: false,
                message: e.message,
                custommessage: "Error while fetching the books",
                data: null
            });
        }
    } catch (e) {
        res.status(500).send({
            status: false,
            message: e.message,
            custommessage: "Server error, try again later!",
            data: null
        });
    }
};


exports.getAllBooks = async (req, res) => {
    try{
        const bookData = await book.findAll({
            include : {
                model : seller,
                as : "seller",
            }
        });
        res.status(200).json({
            status : true,
            message : "book data fetched successfully",
            data : bookData,
        })
    }
    catch(e){
        res.status(500).send({
            status : false,
            message : e.message,
            custommessage : "server error, try again later!",
            data : null,
        })
    }
}

exports.createBook = async (req, res) => {
    try{

        const { title, author, price, totalsold, totalavailable, genre, seller } = req.body;

        const cover = req.files.cover;

        if (!title || !author || !price || !cover || !totalsold || !totalavailable || !genre || !seller) {
            return res.status(400).send({
                status : false,
                message : "All fields are required",
                data : null
            })
        };

        try{

            const cloudinaryResponse = await uploadFile(cover, process.env.CLOUDINARY_FOLDER);

            try{
                const newBook = await book.create({
                    title,
                    author,
                    price,
                    cover : cloudinaryResponse.secure_url,
                    totalsold,
                    totalavailable,
                    genre,
                    seller_id : seller,
                });

                return res.status(201).send({
                    status : true,
                    message : "book created successfully",
                    data : newBook
                });
            }
            catch(e){
                return res.status(500).send({
                    status : false,
                    message : e.message,
                    custommessage : "unable to create a book, try again later!",
                    data : null
                })
            }

        }
        catch(e){
            return res.status(500).send({
                status : false,
                message : e.message,
                custommessage : "unable to upload cover image, try again later!",
                data : null
            })
        }

    }
    catch(e){
        res.status(500).send({
            status : false,
            message : e.message,
            custommessage : "server error, try again later!",
            data : null,
        })
    }
}

exports.updateBook = async (req, res) => {
    try{

        console.log("HELLo")

        const id = req.params.id;

        if (!id) {
            return res.status(400).send({
                status : false,
                message : "id is required",
                data : null
            })
        }

        try{

            const { title, author, price, totalsold, totalavailable, genre } = req.body;

            if (!title || !author || !price || !totalsold || !totalavailable || !genre) {
                return res.status(400).send({
                    status : false,
                    message : "give atleast one field",
                    data : null
                })
            }

            const cover = req.files?.cover;

            let updateBook = null;

            if (cover) {

                const cloudinaryResponse = await uploadFile(cover, process.env.CLOUDINARY_FOLDER);

                updateBook = await book.update({
                    title,
                    author,
                    price,
                    cover : cloudinaryResponse.secure_url,
                    totalsold,
                    totalavailable,
                    genre,
                })

            }

            if (!cover) {
                updateBook = await book.update({
                    title,
                    author,
                    price,
                    totalsold,
                    totalavailable,
                    genre,
                },
                {
                    where : {
                        id
                    }   
                }
                );
            }

            const updatedBookData = await book.findOne({
                where : {
                    id
                }
            });

            console.log(updateBook);

            return res.status(200).json({
                status : true,
                message : "book updated successfully",
                data : updatedBookData
            })

        }

        catch(e){
            res.status(400).send({
                status : false,
                message : e.message,
                custommessage : "error while updating the book, try again later!",
                data : null,
            })
        }

    }
    catch(e){
        res.status(500).send({
            status : false,
            message : e.message,
            custommessage : "server error, try again later!",
            data : null,
        })
    }
}

exports.deleteBook = async (req, res) => {
    try{

        const id = req.params.id;

        if (!id) {
            return res.status(400).send({
                status : false,
                message : "id is required",
                data : null
            })
        }

        try{
            
            const deletedBook = await book.findOne({
                    where : {
                        id
                    }
            });

            const deleteBook = await book.destroy({
                where : {
                    id
                }
            });

            return res.status(200).json({
                status : true,
                message : "book deleted successfully",
                data : deletedBook
            })

        }

        catch(e){
            res.status(400).send({
                status : false,
                message : e.message,
                custommessage : "error while deleting the book, try again later!",
                data : null,
            })
        }

    }
    catch(e){
        res.status(500).send({
            status : false,
            message : e.message,
            custommessage : "server error, try again later!",
            data : null,
        })
    }
}