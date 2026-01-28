import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { InvoicesService } from './invoices.service';

@Controller('invoices')
export class InvoicesController {
    constructor(private readonly invoicesService: InvoicesService) { }

    @Get()
    findAll() {
        return this.invoicesService.findAll();
    }

    @Post('generate-monthly')
    generateMonthly(@Body() body: { period: string, baseAmount?: number }) {
        return this.invoicesService.generateMonthlyBilling(body.period, body.baseAmount || 0);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() body: any) {
        return this.invoicesService.update(+id, body);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.invoicesService.remove(+id);
    }

    @Post(':id/pay')
    recordPayment(
        @Param('id') id: string,
        @Body() body: {
            amount: number,
            paymentDate?: string,
            paymentMethod?: string,
            bankName?: string,
            referenceNumber?: string
        }
    ) {
        const pDate = body.paymentDate ? new Date(body.paymentDate) : undefined;
        return this.invoicesService.recordPayment(
            +id,
            body.amount,
            pDate,
            body.paymentMethod,
            body.bankName,
            body.referenceNumber
        );
    }
}
