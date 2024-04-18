export interface ApiResponseprops {
  statusCode: number;
  data: any;
  message: string;
  success: boolean;
}

const ApiResponse = (
  statusCode: number,
  data: any,
  message: string = "Success"
): ApiResponseprops => {
  return {
    statusCode,
    data,
    message,
    success: statusCode < 400,
  };
};

export default ApiResponse;
