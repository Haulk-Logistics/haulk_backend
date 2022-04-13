const calculate_amount = async (input_distance) => {
    const distance = parseInt(input_distance);
    const initial_amount = 500;
    const required_amount = initial_amount * distance;
    return required_amount;
}

module.exports = {
    calculate_amount
}