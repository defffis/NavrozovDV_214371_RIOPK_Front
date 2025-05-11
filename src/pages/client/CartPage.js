                                <TableBody>
                                    {cart.items.map((item) => (
                                        // Убедимся, что key - это уникальный ID элемента корзины, если он есть
                                        // productId._id может быть не уникальным, если товар добавлен несколько раз (хотя наша текущая логика это предотвращает)
                                        <TableRow key={item._id || item.productId?._id}> 
                                            <TableCell component="th" scope="row">
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <img 
                                                        src={item.productId?.imageUrl || 'https://via.placeholder.com/50?text=N/A'}
                                                        alt={item.productId?.name}
                                                        width="50" 
                                                        height="50" 
                                                        style={{ marginRight: '10px', objectFit: 'cover' }}
                                                    />
                                                    {/* Ссылка на товар, если нужно */}
                                                    <MuiLink component={RouterLink} to={`/products/${item.productId?._id}`}>
                                                        {item.productId?.name || 'Название товара не найдено'}
                                                    </MuiLink>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right">{item.unitPrice?.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</TableCell>
                                            <TableCell align="center">
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {/* Используем item._id для обновления/удаления */}
                                                    <IconButton size="small" onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)} disabled={item.quantity <= 1 || isUpdating}>
                                                        <RemoveIcon fontSize="small" />
                                                    </IconButton>
                                                    <Typography sx={{ mx: 1, minWidth: '20px', textAlign: 'center' }}>{item.quantity}</Typography>
                                                    <IconButton size="small" onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)} disabled={isUpdating}>
                                                        <AddIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right">{item.totalPrice?.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Удалить товар">
                                                    {/* Используем item._id для обновления/удаления */}
                                                    <IconButton color="error" onClick={() => handleRemoveItem(item._id)} disabled={isUpdating}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>

    const handleCreateOrder = async () => {
        // ...
        try {
            const orderData = {
                client: currentUser._id,
                products: cart.items.map(item => ({
                    product: item.productId._id, // ID самого продукта
                    quantity: item.quantity,
                    unitPrice: item.unitPrice, // Цена за единицу, сохраненная в корзине
                })),
            };
            // ...
        } catch (err) {
            // ...
        }
    }; 