type LoadingButtonProps = {
    show: boolean;
};

function LoadingButton({ show }: LoadingButtonProps) {
    return (
        <img
            alt='loading'
            className={`loading ${!show ? 'hide' : ''}`}
            src='images/loading.gif'
        />
    );
}

export default LoadingButton;
